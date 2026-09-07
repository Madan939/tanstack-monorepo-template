import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  UnauthorizedException,
} from "@nestjs/common"
import type { User } from "@prisma/client"
import * as argon2 from "argon2"
import type { AppConfig } from "../../config/configuration"
import { AuthService } from "./auth.service"
import { hashToken } from "./token.service"

const ARGON2_OPTS: argon2.HashOptions = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
}

const PASSWORD = "Correct-Horse-9!"

const argonHash = async (plain: string): Promise<string> =>
  (await argon2.hash(plain, ARGON2_OPTS)).toString()

function makeConfig(): AppConfig {
  return {
    env: "test",
    port: 3000,
    logLevel: "silent",
    corsOrigins: ["http://localhost:5173"],
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
    appUrl: "http://localhost:5173",
    mail: { from: "Test <test@resend.dev>", logOnly: true },
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

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    email: "jane@example.com",
    passwordHash: "not-a-real-hash",
    fullName: "Jane Doe",
    emailVerified: true,
    isActive: true,
    failedLoginAttempts: 0,
    lockedUntil: null,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  } as unknown as User
}

describe("AuthService", () => {
  let service: AuthService
  let prisma: {
    user: Record<string, jest.Mock>
    token: Record<string, jest.Mock>
    session: Record<string, jest.Mock>
    $transaction: jest.Mock
  }
  let tokenService: {
    generateOneTimeToken: jest.Mock
    generateVerificationCode: jest.Mock
    signAccessToken: jest.Mock
    verifyRefreshToken: jest.Mock
  }
  let sessionService: {
    issueSession: jest.Mock
    rotateSession: jest.Mock
    revokeSession: jest.Mock
    revokeAllForUser: jest.Mock
  }
  let mailService: {
    sendVerificationEmail: jest.Mock
    sendPasswordResetEmail: jest.Mock
    sendPasswordChangedEmail: jest.Mock
  }
  const logger = { setContext: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() }
  const config = makeConfig()

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findUniqueOrThrow: jest.fn(),
      },
      token: { findUnique: jest.fn(), create: jest.fn(), deleteMany: jest.fn(), update: jest.fn() },
      session: { updateMany: jest.fn().mockResolvedValue({ count: 0 }) },
      $transaction: jest.fn(async (ops: unknown) => {
        if (typeof ops === "function") return (ops as (tx: typeof prisma) => Promise<unknown>)(prisma as never)
        if (Array.isArray(ops)) return Promise.all(ops as Promise<unknown>[])
        return ops
      }),
    }
    tokenService = {
      generateOneTimeToken: jest.fn().mockReturnValue({
        raw: "raw-one-time-token-0000000000000000000000000",
        hash: hashToken("raw-one-time-token-0000000000000000000000000"),
        bytes: 32,
      }),
      generateVerificationCode: jest.fn().mockReturnValue({
        code: "123456",
        hash: hashToken("123456"),
      }),
      signAccessToken: jest.fn().mockResolvedValue({ token: "access-token", expiresIn: 900 }),
      verifyRefreshToken: jest.fn(),
    }
    sessionService = {
      issueSession: jest
        .fn()
        .mockResolvedValue({ refreshToken: "issued-refresh-token", session: {} }),
      rotateSession: jest.fn(),
      revokeSession: jest.fn().mockResolvedValue(true),
      revokeAllForUser: jest.fn().mockResolvedValue(2),
    }
    mailService = {
      sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
      sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
      sendPasswordChangedEmail: jest.fn().mockResolvedValue(undefined),
    }

    service = new AuthService(
      prisma as never,
      tokenService as never,
      sessionService as never,
      mailService as never,
      logger as never,
      config,
    )
  })

  describe("register", () => {
    it("creates a new user and sends a verification email", async () => {
      prisma.user.findUnique.mockResolvedValue(null)
      prisma.user.create.mockImplementation(async ({ data }: { data: Partial<User> }) =>
        makeUser({ ...data, emailVerified: false }),
      )
      prisma.token.deleteMany.mockResolvedValue({ count: 0 })
      prisma.token.create.mockResolvedValue({})

      const res = await service.register({
        email: "jane@example.com",
        password: PASSWORD,
      })

      expect(prisma.user.create).toHaveBeenCalledTimes(1)
      const data = prisma.user.create.mock.calls[0][0].data
      expect(data.email).toBe("jane@example.com")
      // Stored hash must not be the plaintext and must verify against it.
      await expect(argon2.verify(data.passwordHash as string, PASSWORD)).resolves.toBe(true)
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        "jane@example.com",
        expect.stringMatching(/^\d{6}$/),
      )
      expect(res.message).toContain("verification code")
    })

    it("stays silent for an already verified account (no enumeration)", async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser())

      const res = await service.register({ email: "jane@example.com", password: PASSWORD })

      expect(prisma.user.create).not.toHaveBeenCalled()
      expect(mailService.sendVerificationEmail).not.toHaveBeenCalled()
      expect(res.message).toBe(
        (await service.register({ email: "x@example.com", password: PASSWORD })).message,
      )
    })

    it("re-issues a verification link for unverified duplicate registrations", async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser({ emailVerified: false }))
      prisma.token.deleteMany.mockResolvedValue({ count: 1 })
      prisma.token.create.mockResolvedValue({})

      await service.register({ email: "jane@example.com", password: PASSWORD })

      expect(prisma.user.create).not.toHaveBeenCalled()
      // Never overwrite the existing credential on re-registration.
      expect(prisma.user.update).not.toHaveBeenCalled()
      expect(mailService.sendVerificationEmail).toHaveBeenCalled()
    })
  })

  describe("login", () => {
    it("issues tokens on success and resets failure counters", async () => {
      const passwordHash = await argonHash(PASSWORD)
      prisma.user.findUnique.mockResolvedValue(makeUser({ passwordHash, failedLoginAttempts: 3 }))
      prisma.user.update.mockResolvedValue({})

      const res = await service.login({ email: "jane@example.com", password: PASSWORD })

      expect(res.accessToken).toBe("access-token")
      expect(res.expiresIn).toBe(900)
      expect(sessionService.issueSession).toHaveBeenCalledWith(expect.any(String), {})
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: expect.any(String) },
        data: { failedLoginAttempts: 0, lockedUntil: null },
      })
    })

    it("returns a generic error for unknown emails (timing-equalized)", async () => {
      prisma.user.findUnique.mockResolvedValue(null)

      await expect(
        service.login({ email: "ghost@example.com", password: PASSWORD }),
      ).rejects.toThrow(new UnauthorizedException("Invalid credentials"))
      expect(sessionService.issueSession).not.toHaveBeenCalled()
    })

    it("treats deactivated accounts like unknown ones", async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser({ isActive: false }))

      await expect(
        service.login({ email: "jane@example.com", password: PASSWORD }),
      ).rejects.toThrow(UnauthorizedException)
    })

    it("counts failed attempts on wrong passwords", async () => {
      const passwordHash = await argonHash(PASSWORD)
      prisma.user.findUnique.mockResolvedValue(makeUser({ passwordHash }))

      await expect(
        service.login({ email: "jane@example.com", password: "Wrong-Pass-123!" }),
      ).rejects.toThrow(new UnauthorizedException("Invalid credentials"))
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: expect.any(String) },
        data: { failedLoginAttempts: 1 },
      })
    })

    it("locks the account when the attempt threshold is reached", async () => {
      const passwordHash = await argonHash(PASSWORD)
      prisma.user.findUnique.mockResolvedValue(makeUser({ passwordHash, failedLoginAttempts: 4 }))

      await expect(
        service.login({ email: "jane@example.com", password: "Wrong-Pass-123!" }),
      ).rejects.toThrow(UnauthorizedException)
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: expect.any(String) },
        data: { failedLoginAttempts: 5, lockedUntil: expect.any(Date) },
      })
    })

    it("reveals the lockout only for correct credentials (HTTP 423)", async () => {
      const passwordHash = await argonHash(PASSWORD)
      prisma.user.findUnique.mockResolvedValue(
        makeUser({ passwordHash, lockedUntil: new Date(Date.now() + 600_000) }),
      )

      let status = 0
      try {
        await service.login({ email: "jane@example.com", password: PASSWORD })
      } catch (err) {
        status = (err as HttpException).getStatus()
      }
      expect(status).toBe(423)

      // Wrong credentials on the locked account stay a generic 401.
      await expect(
        service.login({ email: "jane@example.com", password: "Wrong-Pass-123!" }),
      ).rejects.toThrow(UnauthorizedException)
    }, 15000)

    it("forbids login until the email is verified", async () => {
      const passwordHash = await argonHash(PASSWORD)
      prisma.user.findUnique.mockResolvedValue(makeUser({ passwordHash, emailVerified: false }))

      await expect(
        service.login({ email: "jane@example.com", password: PASSWORD }),
      ).rejects.toThrow(ForbiddenException)
    })
  })

  describe("refresh", () => {
    it("rotates tokens via the session service", async () => {
      const user = makeUser()
      sessionService.rotateSession.mockResolvedValue({
        session: { userId: user.id, familyId: "fam" },
        refreshToken: "new-refresh-token",
      })
      prisma.user.findUnique.mockResolvedValue(user)

      const res = await service.refresh("old-refresh-token")

      expect(sessionService.rotateSession).toHaveBeenCalledWith("old-refresh-token", {})
      expect(res.refreshToken).toBe("new-refresh-token")
      expect(tokenService.signAccessToken).toHaveBeenCalledWith(user)
    })

    it("requires a refresh cookie", async () => {
      await expect(service.refresh(undefined)).rejects.toThrow(
        new UnauthorizedException("Missing refresh token"),
      )
    })

    it("revokes the fresh session if the user disappeared or is disabled", async () => {
      sessionService.rotateSession.mockResolvedValue({
        session: { id: "sess-2", userId: "u1" },
        refreshToken: "new-refresh-token",
      })
      prisma.user.findUnique.mockResolvedValue(makeUser({ isActive: false }))

      await expect(service.refresh("stolen-token")).rejects.toThrow(UnauthorizedException)
      expect(sessionService.revokeSession).toHaveBeenCalledWith("sess-2")
    })
  })

  describe("logout", () => {
    it("revokes the presented session", async () => {
      tokenService.verifyRefreshToken.mockResolvedValue({ sub: "u1", sid: "sess-1" })

      await service.logout("refresh-token")

      expect(sessionService.revokeSession).toHaveBeenCalledWith("sess-1")
    })

    it("never fails on invalid tokens", async () => {
      tokenService.verifyRefreshToken.mockRejectedValue(new Error("bad token"))

      await expect(service.logout("garbage")).resolves.toBeUndefined()
      expect(sessionService.revokeSession).not.toHaveBeenCalled()
    })

    it("revokes everything on logout-all", async () => {
      const res = await service.logoutAll("u1")
      expect(sessionService.revokeAllForUser).toHaveBeenCalledWith("u1")
      expect(res.revokedSessions).toBe(2)
    })
  })

  describe("verifyEmail", () => {
    const code = "123456"
    const email = "jane@example.com"

    it("consumes a valid code and verifies the account", async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser({ id: "u1", email }))
      prisma.token.findUnique.mockResolvedValue({
        id: "t1",
        userId: "u1",
        type: "EMAIL_VERIFICATION",
        usedAt: null,
        expiresAt: new Date(Date.now() + 60_000),
      })

      const res = await service.verifyEmail(email, code)

      expect(prisma.$transaction).toHaveBeenCalledTimes(1)
      expect(prisma.token.update).toHaveBeenCalledWith({
        where: { id: "t1" },
        data: { usedAt: expect.any(Date) },
      })
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "u1" },
        data: { emailVerified: true },
      })
      expect(res.message).toContain("verified")
    })

    it.each([
      ["missing user", null, null],
      [
        "used code",
        makeUser({ id: "u1", email }),
        {
          id: "t1",
          userId: "u1",
          type: "EMAIL_VERIFICATION",
          usedAt: new Date(),
          expiresAt: new Date(Date.now() + 60_000),
        },
      ],
      [
        "expired code",
        makeUser({ id: "u1", email }),
        {
          id: "t1",
          userId: "u1",
          type: "EMAIL_VERIFICATION",
          usedAt: null,
          expiresAt: new Date(Date.now() - 60_000),
        },
      ],
      [
        "wrong type",
        makeUser({ id: "u1", email }),
        {
          id: "t1",
          userId: "u1",
          type: "PASSWORD_RESET",
          usedAt: null,
          expiresAt: new Date(Date.now() + 60_000),
        },
      ],
    ])("rejects %s", async (_name, userRow, tokenRow) => {
      prisma.user.findUnique.mockResolvedValue(userRow)
      prisma.token.findUnique.mockResolvedValue(tokenRow)

      await expect(service.verifyEmail(email, code)).rejects.toThrow(BadRequestException)
    })
  })

  describe("forgotPassword / resetPassword", () => {
    it("sends a reset link for active users with a generic response", async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser())
      prisma.token.deleteMany.mockResolvedValue({ count: 0 })
      prisma.token.create.mockResolvedValue({})

      const res = await service.forgotPassword("jane@example.com")

      expect(mailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        "jane@example.com",
        expect.any(String),
      )
      expect(JSON.stringify(res)).not.toContain("jane@example.com")
    })

    it("responds identically for unknown emails", async () => {
      prisma.user.findUnique.mockResolvedValue(null)

      const res = await service.forgotPassword("ghost@example.com")
      expect(mailService.sendPasswordResetEmail).not.toHaveBeenCalled()
      expect(res.message).toBe((await service.forgotPassword("other@example.com")).message)
    })

    it("resets the password, verifies the email and revokes all sessions", async () => {
      const raw = "raw-one-time-token-0000000000000000000000000"
      prisma.token.findUnique.mockResolvedValue({
        id: "t1",
        userId: "u1",
        type: "PASSWORD_RESET",
        usedAt: null,
        expiresAt: new Date(Date.now() + 60_000),
      })
      prisma.user.findUniqueOrThrow.mockResolvedValue(makeUser({ id: "u1", emailVerified: false }))

      const res = await service.resetPassword({ token: raw, newPassword: "Brand-New-Pass-1!" })

      expect(prisma.session.updateMany).toHaveBeenCalledWith({
        where: { userId: "u1", revokedAt: null },
        data: { revokedAt: expect.any(Date) },
      })
      expect(mailService.sendPasswordChangedEmail).toHaveBeenCalled()
      expect(res.message).toContain("reset")
    })

    it("rejects invalid reset tokens without side effects", async () => {
      prisma.token.findUnique.mockResolvedValue(null)

      await expect(
        service.resetPassword({
          token: "nope-nope-nope-nope-nope-nope-nope",
          newPassword: "Brand-New-Pass-1!",
        }),
      ).rejects.toThrow(BadRequestException)
      expect(prisma.session.updateMany).not.toHaveBeenCalled()
      expect(mailService.sendPasswordChangedEmail).not.toHaveBeenCalled()
    })
  })

  describe("changePassword", () => {
    it("rejects a wrong current password", async () => {
      const passwordHash = await argonHash(PASSWORD)
      prisma.user.findUniqueOrThrow.mockResolvedValue(makeUser({ passwordHash }))

      await expect(
        service.changePassword("u1", {
          currentPassword: "Wrong-Pass-123!",
          newPassword: "Another-Pass-123!",
        }),
      ).rejects.toThrow(UnauthorizedException)
    })

    it("rejects reuse of the current password", async () => {
      const passwordHash = await argonHash(PASSWORD)
      prisma.user.findUniqueOrThrow.mockResolvedValue(makeUser({ passwordHash }))

      await expect(
        service.changePassword("u1", { currentPassword: PASSWORD, newPassword: PASSWORD }),
      ).rejects.toThrow(BadRequestException)
    })

    it("updates the hash and revokes all sessions", async () => {
      const passwordHash = await argonHash(PASSWORD)
      prisma.user.findUniqueOrThrow.mockResolvedValue(makeUser({ passwordHash }))

      const res = await service.changePassword("u1", {
        currentPassword: PASSWORD,
        newPassword: "Totally-New-Pass-1!",
      })

      expect(prisma.$transaction).toHaveBeenCalled()
      expect(mailService.sendPasswordChangedEmail).toHaveBeenCalled()
      expect(res.message).toContain("sign in again")
      const ops = prisma.$transaction.mock.calls[0][0] as unknown[]
      expect(ops).toHaveLength(2)
    })
  })
})
