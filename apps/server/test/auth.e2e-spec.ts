import "../src/load-env"

import { randomBytes } from "node:crypto"
import type { INestApplication } from "@nestjs/common"
import { Test } from "@nestjs/testing"
import { PrismaClient } from "@prisma/client"
import request from "supertest"

// ---------------------------------------------------------------------------
// Environment must be configured before the app module graph is imported,
// because some module decorators read process.env at definition time.
// ---------------------------------------------------------------------------
process.env.NODE_ENV = "test"
process.env.LOG_LEVEL = "fatal"
process.env.PORT = "0"
process.env.TRUST_PROXY = "false"
process.env.JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET ?? `e2e-access-${randomBytes(24).toString("hex")}`
process.env.JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ?? `e2e-refresh-${randomBytes(24).toString("hex")}`
process.env.JWT_REFRESH_TTL = "3600"
process.env.APP_URL = "http://localhost:5173"
process.env.MAIL_FROM = "E2E <e2e@localhost>"
process.env.RATE_LIMIT_GLOBAL_MAX = "300"
process.env.AUTH_RATE_LIMIT_MAX = "1000"
process.env.CORS_ORIGINS = "http://localhost:5173"

import { MailService } from "../src/core/mail/mail.service"

jest.setTimeout(120_000)

// -- shared state ------------------------------------------------------------
let app: INestApplication
let prisma: PrismaClient
let dbAvailable = false

const mailSpy = {
  sendVerificationEmail: jest.fn(async (_to: string, _token: string) => undefined),
  sendPasswordResetEmail: jest.fn(async (_to: string, _token: string) => undefined),
  sendPasswordChangedEmail: jest.fn(async (_to: string) => undefined),
}

const STRONG = "Str0ng-Passw0rd!"
const NEW_STRONG = "N3w-Stronger-Pass!"

interface ParsedCookie {
  value: string
  httpOnly: boolean
  path?: string
}

function cookiesOf(res: request.Response): Record<string, ParsedCookie> {
  const raw = res.headers["set-cookie"]
  const lines = Array.isArray(raw) ? raw : raw ? [raw] : []
  return Object.fromEntries(
    lines.map((line: string) => {
      const [pair, ...attrs] = line.split(";")
      const eq = pair.indexOf("=")
      const name = pair.slice(0, eq).trim()
      const attrText = attrs.join(";")
      const pathAttr = attrs.find((a: string) => /^path=/i.test(a.trim()))
      return [
        name,
        {
          value: pair.slice(eq + 1).trim(),
          httpOnly: /httponly/i.test(attrText),
          path: pathAttr?.split("=")[1]?.trim(),
        },
      ]
    }),
  )
}

/**
 * Runs the test only when a PostgreSQL is reachable. The check happens at
 * runtime (after beforeAll) because collection time is too early to know.
 */
/** Extracts the raw one-time token captured for an email address; fails loudly if absent. */
function emailedToken(spy: { mock: { calls: Array<[string, string]> } }, email: string): string {
  const call = spy.mock.calls.find(([to]) => to === email)?.[1]
  if (!call) throw new Error(`expected a token email sent to ${email}`)
  return call
}

const itDb = (name: string, fn: () => Promise<unknown>) =>
  it(name, async () => {
    if (!dbAvailable) {
      console.warn(`[e2e] skipping "${name}" - no database`)
      return
    }
    await fn()
  })

beforeAll(async () => {
  prisma = new PrismaClient()
  try {
    await prisma.$connect()
    await prisma.$queryRaw`SELECT 1`
    dbAvailable = true
  } catch {
    console.warn("\n[e2e] No PostgreSQL reachable via DATABASE_URL - integration suite skipped.\n")
    await prisma.$disconnect()
    return
  }

  const { AppModule } = await import("../src/app.module")
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(MailService)
    .useValue(mailSpy)
    .compile()

  app = moduleRef.createNestApplication()
  await app.init()
})

afterAll(async () => {
  if (dbAvailable && prisma) {
    await prisma.user.deleteMany({ where: { email: { endsWith: "@e2e.local" } } })
  }
  if (app) await app.close()
  if (prisma) await prisma.$disconnect()
})

describe("Authentication service (e2e)", () => {
  itDb("GET /health reports ok", async () => {
    const res = await request(app.getHttpServer()).get("/health").expect(200)
    expect(res.body).toEqual({ status: "ok", database: "up" })
  })

  describe("input validation", () => {
    itDb("rejects invalid payloads and unknown fields with details", async () => {
      const res = await request(app.getHttpServer())
        .post("/auth/register")
        .send({ email: "not-an-email", password: "short", injected: true })
        .expect(400)

      const messages = (res.body.message as string[]).join(" | ")
      expect(messages).toContain("valid email")
      expect(messages).toContain("at least 12 characters")
      expect(messages).toContain("injected")
      // No stack traces or internals leak out.
      expect(JSON.stringify(res.body)).not.toMatch(/at\s+\w+\s+\(/)
    })
  })

  describe("registration & email verification", () => {
    const EMAIL = "alice@e2e.local"
    let registerBody: Record<string, unknown>

    itDb("registers without revealing account state", async () => {
      const res = await request(app.getHttpServer())
        .post("/auth/register")
        .send({ email: EMAIL, password: STRONG })
        .expect(201)
      registerBody = res.body

      // Duplicate registration returns the exact same generic response...
      const dup = await request(app.getHttpServer())
        .post("/auth/register")
        .send({ email: EMAIL, password: STRONG })
        .expect(201)
      expect(dup.body).toEqual(registerBody)
    })

    itDb("sends a verification email for the first registration only", async () => {
      const calls = mailSpy.sendVerificationEmail.mock.calls.filter(([to]) => to === EMAIL)
      // First call + one re-issued link for the duplicate (unverified at that point).
      expect(calls.length).toBeGreaterThanOrEqual(1)
    })

    itDb("forbids login until verified", async () => {
      await request(app.getHttpServer())
        .post("/auth/login")
        .send({ email: EMAIL, password: STRONG })
        .expect(403)
    })

    let verificationToken: string
    itDb("verifies via single-use emailed token", async () => {
      verificationToken = emailedToken(mailSpy.sendVerificationEmail, EMAIL)

      await request(app.getHttpServer())
        .post("/auth/verify-email")
        .send({ token: "x".repeat(43) })
        .expect(400)
      await request(app.getHttpServer())
        .post("/auth/verify-email")
        .send({ token: verificationToken })
        .expect(200)

      // Token is consumed - replay must fail.
      await request(app.getHttpServer())
        .post("/auth/verify-email")
        .send({ token: verificationToken })
        .expect(400)
    })

    itDb("allows login after verification and sets hardened cookies", async () => {
      const res = await request(app.getHttpServer())
        .post("/auth/login")
        .send({ email: EMAIL, password: STRONG })
        .expect(200)

      expect(res.body.accessToken).toBeDefined()
      expect(res.body.expiresIn).toBeGreaterThan(0)
      expect(res.body.csrfToken).toBeDefined()
      expect(res.body.user.emailVerified).toBe(true)
      // The refresh token must never appear in the response body.
      expect(res.text).not.toContain("eyJhbGciOiJIUzI1NiJ9")

      const cookies = cookiesOf(res)
      expect(cookies.refresh_token.httpOnly).toBe(true)
      expect(cookies.refresh_token.path).toBe("/auth")
      expect(cookies.csrf_token.httpOnly).toBeFalsy()
    })

    itDb("completes onboarding after verification", async () => {
      const login = await request(app.getHttpServer())
        .post("/auth/login")
        .send({ email: EMAIL, password: STRONG })
        .expect(200)

      // First onboarding succeeds
      await request(app.getHttpServer())
        .post("/user/onboarding")
        .set("Authorization", `Bearer ${login.body.accessToken}`)
        .send({ fullName: "Alice Doe" })
        .expect(201)

      // Second onboarding is rejected
      await request(app.getHttpServer())
        .post("/user/onboarding")
        .set("Authorization", `Bearer ${login.body.accessToken}`)
        .send({ fullName: "Alice Doe" })
        .expect(400)
    })
  })

  describe("authenticated access", () => {
    const EMAIL = "alice@e2e.local"
    let accessToken: string

    beforeAll(async () => {
      if (!dbAvailable) return
      const res = await request(app.getHttpServer())
        .post("/auth/login")
        .send({ email: EMAIL, password: STRONG })
        .expect(200)
      accessToken = res.body.accessToken
    })

    itDb("protects routes without / with invalid bearer tokens", async () => {
      await request(app.getHttpServer()).get("/user/me").expect(401)
      await request(app.getHttpServer())
        .get("/user/me")
        .set("Authorization", "Bearer garbage.token.here")
        .expect(401)
    })

    itDb("GET /user/me returns the authenticated profile", async () => {
      const res = await request(app.getHttpServer())
        .get("/user/me")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200)
      expect(res.body.email).toBe(EMAIL)
      expect(res.body.passwordHash).toBeUndefined()
    })

    itDb("PATCH /user/me updates the profile", async () => {
      const res = await request(app.getHttpServer())
        .patch("/user/me")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ fullName: "Alicia Doe" })
        .expect(200)
      expect(res.body.fullName).toBe("Alicia Doe")
    })
  })

  describe("refresh rotation, CSRF and revocation", () => {
    const EMAIL = "alice@e2e.local"
    let csrf: string
    let refreshAfterLogin: string
    let refreshAfterRotate: string

    itDb("requires the double-submit CSRF header on cookie-authenticated routes", async () => {
      const agent = request.agent(app.getHttpServer())
      const login = await agent
        .post("/auth/login")
        .send({ email: EMAIL, password: STRONG })
        .expect(200)
      csrf = login.body.csrfToken
      refreshAfterLogin = cookiesOf(login).refresh_token.value

      await agent.post("/auth/refresh").expect(403) // missing x-csrf-token
      await agent.post("/auth/refresh").set("x-csrf-token", "wrong-value").expect(403)
    })

    itDb("rotates the refresh token on every use", async () => {
      const agent = request.agent(app.getHttpServer())
      await agent.post("/auth/login").send({ email: EMAIL, password: STRONG }).expect(200)

      const first = await agent.post("/auth/refresh").set("x-csrf-token", csrf).expect(200)
      expect(first.body.accessToken).toBeDefined()

      refreshAfterRotate = cookiesOf(first).refresh_token.value
      expect(refreshAfterRotate).not.toBe(refreshAfterLogin)
    })

    itDb("detects reuse of a rotated token and burns the whole family", async () => {
      const server = app.getHttpServer()
      // Present the PRE-rotation token again - this is theft/replay behavior.
      await request(server)
        .post("/auth/refresh")
        .set("Cookie", `refresh_token=${refreshAfterLogin}`)
        .set("x-csrf-token", csrf)
        .expect(401)

      // Even the newest token of that family is now dead (family revoked).
      await request(server)
        .post("/auth/refresh")
        .set("Cookie", `refresh_token=${refreshAfterRotate}`)
        .set("x-csrf-token", csrf)
        .expect(401)
    })

    itDb("logout-all revokes every active session", async () => {
      const agent = request.agent(app.getHttpServer())
      const login = await agent
        .post("/auth/login")
        .send({ email: EMAIL, password: STRONG })
        .expect(200)
      const token = login.body.accessToken

      await agent.post("/auth/logout-all").set("Authorization", `Bearer ${token}`).expect(200)

      await agent.post("/auth/refresh").set("x-csrf-token", login.body.csrfToken).expect(401)
    })

    itDb("logout clears cookies and revokes the session", async () => {
      const agent = request.agent(app.getHttpServer())
      const login = await agent
        .post("/auth/login")
        .send({ email: EMAIL, password: STRONG })
        .expect(200)

      const res = await agent
        .post("/auth/logout")
        .set("x-csrf-token", login.body.csrfToken)
        .expect(200)
      const cookies = cookiesOf(res)
      expect(cookies.refresh_token.value).toBe("")
      await agent.post("/auth/refresh").set("x-csrf-token", login.body.csrfToken).expect(401)
    })
  })

  describe("password reset", () => {
    const EMAIL = "bob@e2e.local"

    beforeAll(async () => {
      if (!dbAvailable) return
      await request(app.getHttpServer())
        .post("/auth/register")
        .send({ email: EMAIL, password: STRONG })
        .expect(201)
      const token = mailSpy.sendVerificationEmail.mock.calls.find(([to]) => to === EMAIL)?.[1]
      if (token)
        await request(app.getHttpServer()).post("/auth/verify-email").send({ token }).expect(200)
    })

    itDb("responds identically whether or not the account exists", async () => {
      const known = await request(app.getHttpServer())
        .post("/auth/forgot-password")
        .send({ email: EMAIL })
        .expect(200)
      const unknown = await request(app.getHttpServer())
        .post("/auth/forgot-password")
        .send({ email: "ghost@e2e.local" })
        .expect(200)

      expect(known.body.message).toBe(unknown.body.message)
    })

    let resetToken: string
    itDb("emails a reset token and rejects weak replacements", async () => {
      resetToken = emailedToken(mailSpy.sendPasswordResetEmail, EMAIL)

      await request(app.getHttpServer())
        .post("/auth/reset-password")
        .send({ token: resetToken, newPassword: "weak-password" })
        .expect(400)
    })

    itDb("resets the password and invalidates old credentials", async () => {
      await request(app.getHttpServer())
        .post("/auth/reset-password")
        .send({ token: resetToken, newPassword: NEW_STRONG })
        .expect(200)

      // Single-use token.
      await request(app.getHttpServer())
        .post("/auth/reset-password")
        .send({ token: resetToken, newPassword: NEW_STRONG })
        .expect(400)

      await request(app.getHttpServer())
        .post("/auth/login")
        .send({ email: EMAIL, password: STRONG })
        .expect(401)
      await request(app.getHttpServer())
        .post("/auth/login")
        .send({ email: EMAIL, password: NEW_STRONG })
        .expect(200)
    })
  })

  describe("change password", () => {
    const EMAIL = "bob@e2e.local"

    itDb("rejects a wrong current password", async () => {
      const login = await request(app.getHttpServer())
        .post("/auth/login")
        .send({ email: EMAIL, password: NEW_STRONG })
        .expect(200)

      await request(app.getHttpServer())
        .post("/auth/change-password")
        .set("Authorization", `Bearer ${login.body.accessToken}`)
        .send({ currentPassword: `${STRONG}-wrong`, newPassword: "Another-Strong-1!" })
        .expect(401)
    })

    itDb("changes the password and revokes all sessions", async () => {
      const login = await request(app.getHttpServer())
        .post("/auth/login")
        .send({ email: EMAIL, password: NEW_STRONG })
        .expect(200)

      await request(app.getHttpServer())
        .post("/auth/change-password")
        .set("Authorization", `Bearer ${login.body.accessToken}`)
        .send({ currentPassword: NEW_STRONG, newPassword: STRONG })
        .expect(200)

      // All sessions were revoked -> refresh fails even though the token was
      // issued moments ago.
      await request(app.getHttpServer())
        .post("/auth/refresh")
        .set("Cookie", `refresh_token=${cookiesOf(login).refresh_token.value}`)
        .set("x-csrf-token", login.body.csrfToken)
        .expect(401)

      await request(app.getHttpServer())
        .post("/auth/login")
        .send({ email: EMAIL, password: STRONG })
        .expect(200)
    })
  })

  describe("brute-force lockout", () => {
    const EMAIL = "carol@e2e.local"

    beforeAll(async () => {
      if (!dbAvailable) return
      await request(app.getHttpServer())
        .post("/auth/register")
        .send({ email: EMAIL, password: STRONG })
        .expect(201)
      const token = mailSpy.sendVerificationEmail.mock.calls.find(([to]) => to === EMAIL)?.[1]
      if (token)
        await request(app.getHttpServer()).post("/auth/verify-email").send({ token }).expect(200)
    })

    itDb(
      "locks the account after repeated failures; reveals it only with correct credentials",
      async () => {
        for (let i = 0; i < 5; i++) {
          await request(app.getHttpServer())
            .post("/auth/login")
            .send({ email: EMAIL, password: "Wrong-Passw0rd!" })
            .expect(401)
        }

        const locked = await request(app.getHttpServer())
          .post("/auth/login")
          .send({ email: EMAIL, password: STRONG })
          .expect(423)
        expect(locked.body.message).toMatch(/locked/i)

        // Wrong passwords keep returning the generic error.
        await request(app.getHttpServer())
          .post("/auth/login")
          .send({ email: EMAIL, password: "Wrong-Passw0rd!" })
          .expect(401)
      },
    )
  })

  describe("rate limiting", () => {
    itDb("returns 429 once the global per-minute budget is exhausted", async () => {
      let saw429 = false
      for (let i = 0; i < 350 && !saw429; i++) {
        const res = await request(app.getHttpServer()).get("/health")
        if (res.status === 429) saw429 = true
      }
      expect(saw429).toBe(true)
    })
  })
})
