import { randomBytes } from "node:crypto"
import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common"
import { Prisma, TokenType, type User } from "@prisma/client"
import * as argon2 from "argon2"
import { PinoLogger } from "nestjs-pino"
import { type AppConfig, CONFIG } from "../../config/configuration"
import { MailService } from "../../core/mail/mail.service"
import { PrismaService } from "../../core/prisma/prisma.service"
import { type PublicUser, toPublicUser } from "../users/dto/public-user.dto"
import { ChangePasswordDto } from "./dto/change-password.dto"
import { LoginDto } from "./dto/login.dto"
import { RegisterDto } from "./dto/register.dto"
import { ResetPasswordDto } from "./dto/reset-password.dto"
import { SessionMeta, SessionService } from "./session.service"
import { hashToken, TokenService } from "./token.service"

/**
 * OWASP-recommended argon2id baseline: 19 MiB memory, 2 iterations.
 */
const ARGON2_OPTS: argon2.HashOptions = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
}

/** Identical response for fresh registrations and duplicate emails. */
export const REGISTER_OK_MESSAGE =
  "If this email is not already registered, a verification code has been sent to your inbox. It expires in 10 minutes."

export const FORGOT_OK_MESSAGE =
  "If an account with this email exists and is active, a password reset link has been sent."

export interface AuthTokensResult {
  user: PublicUser
  accessToken: string
  /** Access-token lifetime in seconds. */
  expiresIn: number
  /** Raw refresh token - the controller stores it in a httpOnly cookie. */
  refreshToken: string
  /** Double-submit CSRF token - set as a JS-readable cookie. */
  csrfToken: string
}

@Injectable()
export class AuthService {
  /** Precomputed argon2 hash used to equalize timing for unknown accounts. */
  private dummyHash?: string

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly sessionService: SessionService,
    private readonly mailService: MailService,
    private readonly logger: PinoLogger,
    @Inject(CONFIG) private readonly appConfig: AppConfig,
  ) {
    this.logger.setContext(AuthService.name)
  }

  /**
   * Registers a new account. The response never reveals whether the email
   * was already taken; duplicates with unverified addresses receive a fresh
   * verification email instead (only the mailbox owner can act on it).
   *
   * Production hardening: password hashing is deferred until we know a new
   * row must be created (prevents CPU DoS on duplicate emails).
   */
  async register(dto: RegisterDto): Promise<{ message: string }> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } })

    if (!existing) {
      const passwordHash = await argon2.hash(dto.password, ARGON2_OPTS)
      try {
        const user = await this.prisma.user.create({
          data: {
            email: dto.email,
            passwordHash,
          },
        })
        this.logger.info({ userId: user.id }, "user registered")
        await this.sendEmailVerification(user)
      } catch (err) {
        // Race condition: concurrent registration with same email hits unique constraint.
        // Return generic message to prevent enumeration (same as duplicate case).
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
          this.logger.warn({ email: dto.email }, "concurrent registration race - returning generic")
          // Fall through to generic response
        } else {
          throw err
        }
      }
    } else if (!existing.emailVerified && existing.isActive) {
      // Unverified duplicate registration - rotate the verification link.
      // Do NOT update password; mailbox ownership not yet proven.
      this.logger.info({ userId: existing.id }, "re-registration for unverified account")
      await this.sendEmailVerification(existing)
    } else if (!existing.isActive) {
      // Deactivated account: silent generic to avoid enumeration; optionally alert owner?
      this.logger.warn({ userId: existing.id }, "registration attempt for deactivated account")
    }

    return { message: REGISTER_OK_MESSAGE }
  }

  /**
   * Authenticates a user with brute-force lockout protection and timing-side
   * hardening. On success issues an access token + rotating refresh token.
   */
  async login(dto: LoginDto, meta: SessionMeta = {}): Promise<AuthTokensResult> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } })

    if (!user || !user.isActive) {
      await this.timingEqualizedVerify(dto.password)
      throw new UnauthorizedException("Invalid credentials")
    }

    const passwordValid = await argon2.verify(user.passwordHash, dto.password).catch(() => false)

    // Lockout state is only revealed to callers presenting correct
    // credentials, so it cannot be used to enumerate accounts.
    if (passwordValid && user.lockedUntil && user.lockedUntil > new Date()) {
      throw new HttpException(
        "Account temporarily locked after too many failed sign-in attempts. Try again later.",
        HttpStatus.LOCKED,
      )
    }

    if (!passwordValid) {
      await this.registerFailedAttempt(user)
      throw new UnauthorizedException("Invalid credentials")
    }

    if (!user.emailVerified) {
      throw new ForbiddenException(
        "Email address not verified. Please check your inbox or request a new link.",
      )
    }

    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lockedUntil: null },
      })
    }

    return this.issueAuthResult(user, meta)
  }

  /** Rotates the refresh token pair and mints a fresh access token. */
  async refresh(
    rawRefreshToken: string | undefined,
    meta: SessionMeta = {},
  ): Promise<AuthTokensResult> {
    if (!rawRefreshToken) throw new UnauthorizedException("Missing refresh token")

    const { session, refreshToken } = await this.sessionService.rotateSession(rawRefreshToken, meta)

    const user = await this.prisma.user.findUnique({ where: { id: session.userId } })
    if (!user || !user.isActive) {
      await this.sessionService.revokeSession(session.id)
      throw new UnauthorizedException("Invalid or expired refresh token")
    }

    return this.issueAuthResult(user, meta, refreshToken)
  }

  /**
   * Revokes the presented session. Always succeeds so logout cannot be used
   * to probe token validity.
   */
  async logout(rawRefreshToken: string | undefined): Promise<void> {
    if (!rawRefreshToken) return
    try {
      const payload = await this.tokenService.verifyRefreshToken(rawRefreshToken)
      await this.sessionService.revokeSession(payload.sid)
    } catch {
      // Invalid or expired tokens are ignored - logout must never fail loudly.
    }
  }

  async logoutAll(userId: string): Promise<{ revokedSessions: number }> {
    const revokedSessions = await this.sessionService.revokeAllForUser(userId)
    this.logger.info({ userId, revokedSessions }, "all sessions revoked")
    return { revokedSessions }
  }

  /** Consumes a 6-digit verification code and marks the account verified. */
  async verifyEmail(email: string, code: string): Promise<{ message: string }> {
    const normalizedEmail = email.trim().toLowerCase()
    const user = await this.prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (!user) throw new BadRequestException("Invalid or expired verification code")

    const row = await this.prisma.token.findUnique({ where: { tokenHash: hashToken(code) } })

    if (
      !row ||
      row.type !== TokenType.EMAIL_VERIFICATION ||
      row.userId !== user.id ||
      row.usedAt !== null ||
      row.expiresAt <= new Date()
    ) {
      throw new BadRequestException("Invalid or expired verification code")
    }

    await this.prisma.$transaction([
      this.prisma.token.update({ where: { id: row.id }, data: { usedAt: new Date() } }),
      this.prisma.user.update({ where: { id: row.userId }, data: { emailVerified: true } }),
    ])

    this.logger.info({ userId: row.userId }, "email verified via code")
    return { message: "Email verified successfully" }
  }

  /** Backward compat: verify by raw token (legacy link flow). */
  async verifyEmailByToken(token: string): Promise<{ message: string }> {
    const row = await this.prisma.token.findUnique({ where: { tokenHash: hashToken(token) } })

    if (
      !row ||
      row.type !== TokenType.EMAIL_VERIFICATION ||
      row.usedAt !== null ||
      row.expiresAt <= new Date()
    ) {
      throw new BadRequestException("Invalid or expired verification token")
    }

    await this.prisma.$transaction([
      this.prisma.token.update({ where: { id: row.id }, data: { usedAt: new Date() } }),
      this.prisma.user.update({ where: { id: row.userId }, data: { emailVerified: true } }),
    ])

    this.logger.info({ userId: row.userId }, "email verified")
    return { message: "Email verified successfully" }
  }

  /** Re-sends the verification link. Response is always generic. */
  async resendVerification(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (user?.isActive && !user.emailVerified) {
      await this.sendEmailVerification(user)
      this.logger.info({ userId: user.id }, "verification resent")
    }
    // Deactivated or already-verified => silent generic (no enumeration)
    return { message: REGISTER_OK_MESSAGE }
  }

  /** Issues a password-reset token. The response is always generic. */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (user?.isActive) {
      const ttlMs = this.appConfig.limits.passwordResetTtlMinutes * 60_000
      const raw = await this.issueOneTimeToken(user.id, TokenType.PASSWORD_RESET, ttlMs)
      await this.mailService.sendPasswordResetEmail(user.email, raw)
      this.logger.info({ userId: user.id }, "password reset requested")
    }
    return { message: FORGOT_OK_MESSAGE }
  }

  /**
   * Consumes a password-reset token, sets the new password, verifies the
   * email address (mailbox ownership was just proven) and revokes all
   * sessions so stolen cookies become useless.
   */
  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const row = await this.prisma.token.findUnique({ where: { tokenHash: hashToken(dto.token) } })

    if (
      !row ||
      row.type !== TokenType.PASSWORD_RESET ||
      row.usedAt !== null ||
      row.expiresAt <= new Date()
    ) {
      throw new BadRequestException("Invalid or expired reset token")
    }

    const passwordHash = await argon2.hash(dto.newPassword, ARGON2_OPTS)
    const now = new Date()

    await this.prisma.$transaction([
      this.prisma.token.update({ where: { id: row.id }, data: { usedAt: now } }),
      this.prisma.user.update({
        where: { id: row.userId },
        data: {
          passwordHash,
          emailVerified: true,
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      }),
      this.prisma.session.updateMany({
        where: { userId: row.userId, revokedAt: null },
        data: { revokedAt: now },
      }),
    ])

    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: row.userId } })
    await this.mailService.sendPasswordChangedEmail(user.email)
    this.logger.info({ userId: row.userId }, "password reset completed")

    return { message: "Password has been reset. You can now sign in." }
  }

  /**
   * Changes the password of the authenticated user and revokes every
   * session (including the current one), forcing re-login everywhere.
   */
  async changePassword(userId: string, dto: ChangePasswordDto): Promise<{ message: string }> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } })

    const valid = await argon2.verify(user.passwordHash, dto.currentPassword).catch(() => false)
    if (!valid) throw new UnauthorizedException("Current password is incorrect")

    const reusesCurrentPassword = await argon2
      .verify(user.passwordHash, dto.newPassword)
      .catch(() => false)
    if (reusesCurrentPassword)
      throw new BadRequestException("New password must be different from the current one")

    const passwordHash = await argon2.hash(dto.newPassword, ARGON2_OPTS)
    const now = new Date()

    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
      this.prisma.session.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: now },
      }),
    ])

    await this.mailService.sendPasswordChangedEmail(user.email)
    this.logger.info({ userId: user.id }, "password changed")

    return { message: "Password updated. Please sign in again on all devices." }
  }

  // -- internals ---------------------------------------------------------------

  private async issueAuthResult(
    user: User,
    meta: SessionMeta,
    existingRefreshToken?: string,
  ): Promise<AuthTokensResult> {
    const refreshToken =
      existingRefreshToken ?? (await this.sessionService.issueSession(user.id, meta)).refreshToken
    const access = await this.tokenService.signAccessToken(user)

    return {
      user: toPublicUser(user),
      accessToken: access.token,
      expiresIn: access.expiresIn,
      refreshToken,
      csrfToken: randomBytes(32).toString("base64url"),
    }
  }

  private async sendEmailVerification(user: User): Promise<void> {
    const ttlMs = this.appConfig.limits.emailVerificationTtlMinutes * 60_000
    // Retry on global hash collision (1M space for 6-digit codes)
    for (let attempt = 0; attempt < 5; attempt++) {
      const { code, hash } = this.tokenService.generateVerificationCode()
      const expiresAt = new Date(Date.now() + ttlMs)
      try {
        await this.prisma.$transaction(async (tx) => {
          await tx.token.deleteMany({
            where: { userId: user.id, type: TokenType.EMAIL_VERIFICATION },
          })
          await tx.token.create({
            data: {
              userId: user.id,
              type: TokenType.EMAIL_VERIFICATION,
              tokenHash: hash,
              expiresAt,
            },
          })
        })
        await this.mailService.sendVerificationEmail(user.email, code)
        return
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === "P2002" &&
          attempt < 4
        ) {
          this.logger.warn(
            { userId: user.id, attempt },
            "verification code hash collision, retrying",
          )
          continue
        }
        throw err
      }
    }
  }

  /** Invalidates previous tokens of the same type, then persists a new one atomically. */
  private async issueOneTimeToken(userId: string, type: TokenType, ttlMs: number): Promise<string> {
    const { raw, hash } = this.tokenService.generateOneTimeToken()
    const expiresAt = new Date(Date.now() + ttlMs)
    // Atomic: delete old + insert new in one transaction so a failure never leaves the user without a token unexpectedly
    await this.prisma.$transaction(async (tx) => {
      await tx.token.deleteMany({ where: { userId, type } })
      await tx.token.create({
        data: { userId, type, tokenHash: hash, expiresAt },
      })
    })
    return raw
  }

  private async registerFailedAttempt(user: User): Promise<void> {
    const attempts = user.failedLoginAttempts + 1
    const { lockoutMaxAttempts, lockoutTtlMinutes } = this.appConfig.limits
    const lockExpired = !user.lockedUntil || user.lockedUntil <= new Date()
    const shouldLock = attempts >= lockoutMaxAttempts && lockExpired

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: attempts,
        ...(shouldLock ? { lockedUntil: new Date(Date.now() + lockoutTtlMinutes * 60_000) } : {}),
      },
    })

    if (shouldLock) {
      this.logger.warn({ userId: user.id }, "account locked after repeated failed sign-ins")
    }
  }

  /**
   * Verifies the password against a precomputed hash when the account does
   * not exist / is disabled, keeping response times indistinguishable and
   * preventing user enumeration via timing analysis.
   */
  private async timingEqualizedVerify(password: string): Promise<void> {
    if (!this.dummyHash) {
      this.dummyHash = await argon2.hash(randomBytes(16).toString("base64url"), ARGON2_OPTS)
    }
    await argon2.verify(this.dummyHash, password).catch(() => false)
  }
}
