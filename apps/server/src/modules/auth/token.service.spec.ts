import { createHash } from "node:crypto"
import { JwtService } from "@nestjs/jwt"
import { AppConfigService } from "../../config/app-config.service"
import { hashToken, TokenService } from "./token.service"

const config = {
  env: "test" as const,
  port: 3000,
  logLevel: "silent",
  corsOrigins: [],
  trustProxy: false,
  swaggerEnabled: false,
  jwt: {
    accessSecret: "access-secret-0123456789abcdef0123456789abcdef",
    accessTtlSeconds: 900,
    refreshSecret: "refresh-secret-0123456789abcdef0123456789abc",
    refreshTtlSeconds: 604800,
  },
  cookies: {
    secure: false,
    sameSite: "strict" as const,
    refreshTokenName: "r",
    csrfTokenName: "c",
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

describe("TokenService", () => {
  let service: TokenService

  beforeEach(() => {
    service = new TokenService(new JwtService(), new AppConfigService(config))
  })

  describe("access tokens", () => {
    it("signs and verifies a round trip with the access secret", async () => {
      const user = { id: "u1", email: "jane@example.com" }

      const { token } = await service.signAccessToken(user)

      const jwt = new JwtService({ secret: config.jwt.accessSecret })
      const payload = await jwt.verifyAsync(token)
      expect(payload.sub).toBe("u1")
      expect(payload.email).toBe("jane@example.com")
      // ~15 minutes
      expect((payload.exp as number) - (payload.iat as number)).toBe(900)
    })
  })

  describe("refresh tokens", () => {
    it("binds a session id and verifies against the refresh secret", async () => {
      const token = await service.signRefreshToken({ sub: "u1", sid: "sess-1" })
      const payload = await service.verifyRefreshToken(token)

      expect(payload).toMatchObject({ sub: "u1", sid: "sess-1" })
      expect((payload.exp as number) - (payload.iat as number)).toBe(604800)
    })

    it("rejects refresh-token signatures made with the access secret", async () => {
      const user = { id: "u1", email: "jane@example.com" }
      const accessToken = (await service.signAccessToken(user)).token

      // An access token must never verify as a refresh token.
      await expect(service.verifyRefreshToken(accessToken)).rejects.toThrow()
    })
  })

  describe("one-time tokens", () => {
    it("generates high-entropy url-safe tokens with matching hashes", () => {
      const first = service.generateOneTimeToken()
      const second = service.generateOneTimeToken()

      expect(first.raw).not.toBe(second.raw)
      // 32 bytes => 43 base64url chars
      expect(first.raw).toMatch(/^[A-Za-z0-9_-]{43}$/)
      expect(first.hash).toBe(hashToken(first.raw))
    })
  })

  describe("hashToken", () => {
    it("produces sha-256 hex digests", () => {
      expect(hashToken("x")).toBe(createHash("sha256").update("x").digest("hex"))
    })
  })
})
