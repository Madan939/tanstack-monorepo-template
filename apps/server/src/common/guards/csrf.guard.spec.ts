import { ExecutionContext, ForbiddenException } from "@nestjs/common"
import type { Request } from "express"
import { AppConfigService } from "../../config/app-config.service"
import { CsrfGuard } from "./csrf.guard"

const config = {
  env: "test" as const,
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
    sameSite: "strict" as const,
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

function makeContext(
  method: string,
  cookies?: Record<string, string>,
  headers: Record<string, string> = {},
) {
  const request = {
    method,
    cookies,
    headers,
  } as unknown as Request
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext
}

describe("CsrfGuard", () => {
  let guard: CsrfGuard

  beforeEach(() => {
    guard = new CsrfGuard(new AppConfigService(config))
  })

  it("passes when header matches the cookie (double submit)", () => {
    const ctx = makeContext("POST", { csrf_token: "token-123" }, { "x-csrf-token": "token-123" })
    expect(guard.canActivate(ctx)).toBe(true)
  })

  it("rejects when the cookie is missing", () => {
    const ctx = makeContext("POST", undefined, { "x-csrf-token": "token-123" })
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException)
  })

  it("rejects when the header is missing", () => {
    const ctx = makeContext("POST", { csrf_token: "token-123" })
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException)
  })

  it("rejects mismatched values without timing leaks", () => {
    const ctx = makeContext("POST", { csrf_token: "token-123" }, { "x-csrf-token": "other-value" })
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException)
  })

  it("ignores safe methods entirely", () => {
    for (const method of ["GET", "HEAD", "OPTIONS"]) {
      const ctx = makeContext(method, undefined, {})
      expect(guard.canActivate(ctx)).toBe(true)
    }
  })
})
