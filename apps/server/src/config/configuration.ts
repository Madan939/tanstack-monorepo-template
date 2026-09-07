import { ConfigService } from "@nestjs/config"

export interface AppConfig {
  env: "development" | "test" | "production"
  port: number
  logLevel: string
  corsOrigins: string[]
  trustProxy: boolean

  /** Exposes OpenAPI docs at /docs. Defaults to false in production. */
  swaggerEnabled: boolean

  jwt: {
    accessSecret: string
    accessTtlSeconds: number
    refreshSecret: string
    refreshTtlSeconds: number
  }

  cookies: {
    domain?: string
    secure: boolean
    sameSite: "strict"
    refreshTokenName: string
    csrfTokenName: string
    accessTokenName: string
  }

  appUrl: string

  mail: {
    from: string
    bcc?: string
    /** True when RESEND_API_KEY is not set and emails go to the log. */
    logOnly: boolean
  }

  limits: {
    globalRateLimitPerMinute: number
    authRateLimitPerMinute: number
    lockoutMaxAttempts: number
    lockoutTtlMinutes: number
    emailVerificationTtlHours: number
    emailVerificationTtlMinutes: number
    passwordResetTtlMinutes: number
  }
}

export const CONFIG = Symbol("APP_CONFIG")

export function configFactory(cs: ConfigService): AppConfig {
  const resendApiKey = cs.get<string>("RESEND_API_KEY", "") ?? ""

  return {
    env: cs.getOrThrow<"development" | "test" | "production">("NODE_ENV"),
    port: cs.getOrThrow<number>("PORT"),
    logLevel: cs.getOrThrow<string>("LOG_LEVEL"),
    corsOrigins: (cs.getOrThrow<string>("CORS_ORIGINS") ?? "")
      .split(",")
      .map((o) => o.trim().replace(/\/$/, ""))
      .filter(Boolean),
    trustProxy: cs.getOrThrow<boolean>("TRUST_PROXY"),
    swaggerEnabled: cs.getOrThrow<boolean>("SWAGGER_ENABLED"),

    jwt: {
      accessSecret: cs.getOrThrow<string>("JWT_ACCESS_SECRET"),
      accessTtlSeconds: cs.getOrThrow<number>("JWT_ACCESS_TTL"),
      refreshSecret: cs.getOrThrow<string>("JWT_REFRESH_SECRET"),
      refreshTtlSeconds: cs.getOrThrow<number>("JWT_REFRESH_TTL"),
    },

    cookies: {
      domain: cs.get<string>("COOKIE_DOMAIN", "") || undefined,
      // Cookies must be Secure in production (HTTPS-only).
      secure: cs.getOrThrow<"development" | "test" | "production">("NODE_ENV") === "production",
      sameSite: "strict",
      refreshTokenName: "refresh_token",
      csrfTokenName: "csrf_token",
      accessTokenName: "admin_access_token",
    },

    appUrl: cs.getOrThrow<string>("APP_URL"),

    mail: {
      from: cs.getOrThrow<string>("MAIL_FROM"),
      bcc: cs.get<string>("BCC_BUSINESS_EMAIL", "") || undefined,
      logOnly: !resendApiKey,
    },

    limits: {
      globalRateLimitPerMinute: cs.getOrThrow<number>("RATE_LIMIT_GLOBAL_MAX"),
      authRateLimitPerMinute: cs.getOrThrow<number>("AUTH_RATE_LIMIT_MAX"),
      lockoutMaxAttempts: cs.getOrThrow<number>("LOCKOUT_MAX_ATTEMPTS"),
      lockoutTtlMinutes: cs.getOrThrow<number>("LOCKOUT_TTL_MINUTES"),
      emailVerificationTtlHours: cs.getOrThrow<number>("EMAIL_VERIFICATION_TTL_HOURS"),
      emailVerificationTtlMinutes: cs.getOrThrow<number>("EMAIL_VERIFICATION_TTL_MINUTES"),
      passwordResetTtlMinutes: cs.getOrThrow<number>("PASSWORD_RESET_TTL_MINUTES"),
    },
  }
}
