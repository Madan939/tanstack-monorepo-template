import { createHash, randomBytes, timingSafeEqual } from "node:crypto"
import { Injectable } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { AppConfigService } from "../../config/app-config.service"

export interface AccessTokenPayload {
  sub: string
  email: string
  emailVerified?: boolean
  isActive?: boolean
  iat?: number
  exp?: number
}

export interface RefreshTokenPayload {
  /** User id. */
  sub: string
  /** Session id - links the JWT to its revocable DB row. */
  sid: string
  iat?: number
  exp?: number
}

/**
 * Minimal user shape used by the authentication guards.
 * Consumers may extend this interface if they need additional fields.
 */
export interface AuthenticatedUser {
  /** User id. */
  sub: string
  email: string
  /** True when the user has verified their email address. */
  emailVerified?: boolean
  isActive?: boolean
}

/**
 * TokenService – responsible for signing / verifying JWTs used by the
 * authentication system.  Tokens may be supplied via an httpOnly cookie
 * (`admin_access_token`) or the standard `Authorization: Bearer <token>` header.
 */
@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly appConfig: AppConfigService,
  ) {}

  /**
   * Sign a short‑lived access token.
   *
   * The *user* argument only needs to provide the three fields that go
   * into the JWT: `id`, `email`, and `emailVerified`.  Additional properties
   * are ignored, which makes the function easy to call from tests or from
   * places that only have a partial user shape.
   */
  async signAccessToken(user: Record<string, unknown>): Promise<{
    token: string
    expiresIn: number
  }> {
    const id = (user as { id: string }).id
    const email = (user as { email: string }).email
    const emailVerified = (user as { emailVerified?: boolean }).emailVerified
    const isActive = (user as { isActive?: boolean }).isActive ?? true
    const expiresIn = this.appConfig.config.jwt.accessTtlSeconds
    const token = await this.jwt.signAsync(
      {
        sub: id,
        email,
        emailVerified,
        isActive,
      },
      {
        secret: this.appConfig.config.jwt.accessSecret,
        expiresIn,
        algorithm: "HS256",
      },
    )
    return { token, expiresIn }
  }

  signRefreshToken(payload: { sub: string; sid: string }): Promise<string> {
    return this.jwt.signAsync(payload, {
      secret: this.appConfig.config.jwt.refreshSecret,
      expiresIn: this.appConfig.config.jwt.refreshTtlSeconds,
      algorithm: "HS256",
    })
  }

  verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    return this.jwt.verifyAsync<RefreshTokenPayload>(token, {
      secret: this.appConfig.config.jwt.refreshSecret,
      ignoreExpiration: false,
      algorithms: ["HS256"],
    })
  }

  /** Opaque, URL‑safe one‑time token (email verification / password reset). */
  generateOneTimeToken(): { raw: string; hash: string; bytes: number } {
    const raw = randomBytes(32).toString("base64url")
    return { raw, hash: hashToken(raw), bytes: 32 }
  }

  /** 6-digit numeric code for email verification (10 min expiry). */
  generateVerificationCode(): { code: string; hash: string } {
    // Secure random 0-999999, padded to 6 digits, avoids modulo bias via randomInt if available
    const num = randomBytes(4).readUInt32BE(0) % 1_000_000
    const code = num.toString().padStart(6, "0")
    return { code, hash: hashToken(code) }
  }
}

/** SHA‑256 hex digest. Only hashes of tokens are persisted, never raw values. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex")
}

/** Constant‑time comparison that does not leak length information. */
export function safeCompare(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest()
  const hb = createHash("sha256").update(b).digest()
  return timingSafeEqual(ha, hb)
}
