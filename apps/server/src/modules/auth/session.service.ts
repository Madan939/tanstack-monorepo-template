import { randomUUID } from "node:crypto"
import { Injectable, UnauthorizedException } from "@nestjs/common"
import { Prisma, type Session } from "@prisma/client"
import { Logger } from "nestjs-pino"
import { AppConfigService } from "../../config/app-config.service"
import { PrismaService } from "../../core/prisma/prisma.service"
import { hashToken, TokenService } from "./token.service"

export interface SessionMeta {
  userAgent?: string
  ipAddress?: string
}

export interface IssuedSession {
  session: Session
  refreshToken: string
}

/**
 * Owns the refresh-token lifecycle:
 *
 * - Refresh tokens are JWTs whose `sid` claim points at a revocable DB row.
 * - Only SHA-256 hashes of refresh tokens are persisted.
 * - Every use rotates the token: the old row is marked revoked and linked to
 *   its replacement via `replacedById`.
 * - All rows issued for one login share a `familyId`. If a token that was
 *   already rotated is presented again, this indicates theft/replay and the
 *   entire family is revoked immediately.
 */
@Injectable()
export class SessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly appConfig: AppConfigService,
    private readonly logger: Logger,
  ) {}

  /** Creates a new token family with its first refresh token. */
  async issueSession(userId: string, meta: SessionMeta = {}): Promise<IssuedSession> {
    const familyId = randomUUID()
    return this.issueRotatedToken(userId, familyId, meta)
  }

  /**
   * Validates a presented refresh token and rotates it. Throws on invalid,
   * expired or replayed tokens (revoking the whole family in the latter case).
   */
  async rotateSession(rawRefreshToken: string, meta: SessionMeta = {}): Promise<IssuedSession> {
    let payload: { sub: string; sid: string; iat?: number; exp?: number }
    try {
      payload = await this.tokenService.verifyRefreshToken(rawRefreshToken)
    } catch {
      throw new UnauthorizedException("Invalid or expired refresh token")
    }

    const now = new Date()
    const result = await this.prisma.$transaction(async (tx) => {
      const current = await tx.session.findUnique({ where: { id: payload.sid } })

      if (!current || current.revokedAt || current.replacedById) {
        // Already-rotated token => probable theft. Burn the family.
        // Only revoke when `replacedById` is set (rotated), not when merely revoked via logout.
        if (current?.replacedById) {
          await tx.session.updateMany({
            where: { familyId: current.familyId, revokedAt: null },
            data: { revokedAt: now },
          })
          this.logger.warn(
            { userId: current.userId, sessionId: current.id, replacedById: current.replacedById },
            "refresh token reuse detected - family revoked",
          )
        }
        throw new UnauthorizedException("Invalid refresh token")
      }

      if (current.expiresAt <= now)
        throw new UnauthorizedException("Invalid or expired refresh token")

      const rotated = await this.issueRotatedTokenTx(tx, current.userId, current.familyId, meta)
      await tx.session.update({
        where: { id: current.id },
        data: { revokedAt: now, replacedById: rotated.session.id },
      })
      return rotated
    })

    return result
  }

  /** Revokes one session (used by logout). Returns true when it existed. */
  async revokeSession(sessionId: string): Promise<boolean> {
    const res = await this.prisma.session.updateMany({
      where: { id: sessionId, revokedAt: null },
      data: { revokedAt: new Date() },
    })
    return res.count > 0
  }

  /** Revokes every active session of a user (logout-all / password change). */
  async revokeAllForUser(userId: string): Promise<number> {
    const res = await this.prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    })
    return res.count
  }

  /** Housekeeping helper: purge expired sessions older than the cutoff. */
  async purgeExpiredSessions(olderThan: Date): Promise<number> {
    const res = await this.prisma.session.deleteMany({
      where: { expiresAt: { lt: olderThan } },
    })
    return res.count
  }

  // -- internals ------------------------------------------------------------

  private async issueRotatedToken(
    userId: string,
    familyId: string,
    meta: SessionMeta,
  ): Promise<IssuedSession> {
    return this.prisma.$transaction((tx) => this.issueRotatedTokenTx(tx, userId, familyId, meta))
  }

  private async issueRotatedTokenTx(
    tx: Prisma.TransactionClient,
    userId: string,
    familyId: string,
    meta: SessionMeta,
  ): Promise<IssuedSession> {
    const sid = randomUUID()
    const refreshToken = await this.tokenService.signRefreshToken({ sub: userId, sid })
    const expiresAt = new Date(Date.now() + this.appConfig.config.jwt.refreshTtlSeconds * 1000)

    const session = await tx.session.create({
      data: {
        id: sid,
        userId,
        familyId,
        refreshTokenHash: hashToken(refreshToken),
        expiresAt,
        userAgent: meta.userAgent?.slice(0, 255),
        ipAddress: meta.ipAddress?.slice(0, 45),
      },
    })
    return { session, refreshToken }
  }
}
