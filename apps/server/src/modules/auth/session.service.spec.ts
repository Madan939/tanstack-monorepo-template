import { UnauthorizedException } from "@nestjs/common"
import type { AppConfig } from "../../config/configuration"
import type { SessionMeta } from "./session.service"
import { SessionService } from "./session.service"

function makeConfig(): AppConfig {
  return {
    env: "test",
    port: 3000,
    logLevel: "silent",
    corsOrigins: [],
    trustProxy: false,
    swaggerEnabled: false,
    jwt: {
      accessSecret: "a".repeat(48),
      accessTtlSeconds: 900,
      refreshSecret: "b".repeat(48),
      refreshTtlSeconds: 604800,
    },
    cookies: {
      secure: false,
      sameSite: "strict",
      refreshTokenName: "refresh_token",
      csrfTokenName: "csrf_token",
      accessTokenName: "admin_access_token",
    },
    appUrl: "http://localhost",
    mail: { from: "t@t", logOnly: true },
    limits: {
      globalRateLimitPerMinute: 100,
      authRateLimitPerMinute: 10,
      lockoutMaxAttempts: 5,
      lockoutTtlMinutes: 15,
      emailVerificationTtlHours: 24,
    emailVerificationTtlMinutes: 10,
      passwordResetTtlMinutes: 15,
    },
  }
}

describe("SessionService", () => {
  let service: SessionService
  let prisma: {
    session: Record<string, jest.Mock>
    $transaction: jest.Mock
  }
  let tokenService: { signRefreshToken: jest.Mock; verifyRefreshToken: jest.Mock }
  const logger = { warn: jest.fn(), info: jest.fn(), error: jest.fn(), setContext: jest.fn() }

  const userId = "11111111-1111-4111-8111-111111111111"
  const meta: SessionMeta = { userAgent: "jest", ipAddress: "127.0.0.1" }

  const sessionRow = (overrides: Record<string, unknown> = {}) => ({
    id: "sess-current",
    userId,
    familyId: "fam-1",
    refreshTokenHash: "hash-current",
    expiresAt: new Date(Date.now() + 60_000),
    revokedAt: null,
    replacedById: null,
    ...overrides,
  })

  beforeEach(() => {
    prisma = {
      session: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
      $transaction: jest.fn((fn: (tx: unknown) => unknown) => fn(prisma)),
    }
    tokenService = {
      // Deterministic distinct tokens per call.
      signRefreshToken: jest.fn(async ({ sid }: { sid: string }) => `rt-${sid}`),
      verifyRefreshToken: jest.fn(async (raw: string) => ({
        sub: userId,
        sid: raw.replace("rt-", ""),
        iat: 0,
        exp: Math.floor(Date.now() / 1000) + 3600,
      })),
    }
    prisma.session.create.mockImplementation(
      async ({ data }: { data: Record<string, unknown> }) => ({
        ...sessionRow(),
        ...data,
        createdAt: new Date(),
      }),
    )

    service = new SessionService(
      prisma as never,
      tokenService as never,
      { config: makeConfig() } as never,
      logger as never,
    )
  })

  describe("issueSession", () => {
    it("creates the first session of a new family with a hashed refresh token", async () => {
      const issued = await service.issueSession(userId, meta)

      expect(issued.session.userId).toBe(userId)
      expect(issued.session.refreshTokenHash).not.toBe(issued.refreshToken)
      expect(issued.session.userAgent).toBe("jest")
      expect(issued.session.ipAddress).toBe("127.0.0.1")
      expect(issued.session.revokedAt).toBeNull()
    })

    it("sets an expiry based on the configured TTL", async () => {
      const before = Date.now()
      const issued = await service.issueSession(userId, meta)
      const expectedMs = 604800 * 1000

      const skew = issued.session.expiresAt.getTime() - (before + expectedMs)
      expect(Math.abs(skew)).toBeLessThan(2000)
    })
  })

  describe("rotateSession", () => {
    it("rotates a valid token: revokes old row and links its replacement", async () => {
      prisma.session.findUnique.mockResolvedValue(sessionRow())

      const rotated = await service.rotateSession("rt-sess-current", meta)

      expect(rotated.session.familyId).toBe("fam-1")
      expect(rotated.session.id).not.toBe("sess-current")
      expect(rotated.session.revokedAt).toBeNull()
      expect(prisma.session.update).toHaveBeenCalledWith({
        where: { id: "sess-current" },
        data: { revokedAt: expect.any(Date), replacedById: rotated.session.id },
      })
    })

    it("burns the whole family when an already-rotated token is replayed", async () => {
      prisma.session.findUnique.mockResolvedValue(
        sessionRow({ replacedById: "sess-newer", revokedAt: null }),
      )

      await expect(service.rotateSession("rt-sess-current", meta)).rejects.toThrow(
        UnauthorizedException,
      )

      // Family-wide revocation of still-active rows.
      expect(prisma.session.updateMany).toHaveBeenCalledWith({
        where: { familyId: "fam-1", revokedAt: null },
        data: { revokedAt: expect.any(Date) },
      })
      expect(logger.warn).toHaveBeenCalled()
    })

    it("rejects tokens for sessions that do not exist", async () => {
      prisma.session.findUnique.mockResolvedValue(null)

      await expect(service.rotateSession("rt-unknown", meta)).rejects.toThrow(UnauthorizedException)
      expect(prisma.session.updateMany).not.toHaveBeenCalled()
    })

    it("rejects already revoked tokens without re-revoking the family", async () => {
      prisma.session.findUnique.mockResolvedValue(sessionRow({ revokedAt: new Date() }))

      await expect(service.rotateSession("rt-sess-current", meta)).rejects.toThrow(
        UnauthorizedException,
      )
      expect(prisma.session.updateMany).not.toHaveBeenCalled()
    })

    it("rejects expired sessions even when not revoked", async () => {
      prisma.session.findUnique.mockResolvedValue(
        sessionRow({ expiresAt: new Date(Date.now() - 1000) }),
      )

      await expect(service.rotateSession("rt-sess-current", meta)).rejects.toThrow(
        UnauthorizedException,
      )
    })

    it("rejects cryptographically invalid tokens before touching the DB", async () => {
      tokenService.verifyRefreshToken.mockRejectedValue(new Error("jwt malformed"))

      await expect(service.rotateSession("garbage", meta)).rejects.toThrow(UnauthorizedException)
      expect(prisma.$transaction).not.toHaveBeenCalled()
    })
  })

  describe("revocation helpers", () => {
    it("revokeSession reports whether a row changed", async () => {
      prisma.session.updateMany.mockResolvedValueOnce({ count: 1 })
      await expect(service.revokeSession("sess-1")).resolves.toBe(true)

      prisma.session.updateMany.mockResolvedValueOnce({ count: 0 })
      await expect(service.revokeSession("sess-1")).resolves.toBe(false)
    })

    it("revokeAllForUser returns the number of revoked sessions", async () => {
      prisma.session.updateMany.mockResolvedValueOnce({ count: 3 })
      await expect(service.revokeAllForUser(userId)).resolves.toBe(3)
    })

    it("purgeExpiredSessions deletes only expired rows", async () => {
      prisma.session.deleteMany = jest.fn().mockResolvedValue({ count: 5 })
      const cutoff = new Date(Date.now() - 30 * 86_400_000)
      await expect(service.purgeExpiredSessions(cutoff)).resolves.toBe(5)
      expect(prisma.session.deleteMany).toHaveBeenCalledWith({
        where: { expiresAt: { lt: cutoff } },
      })
    })
  })
})
