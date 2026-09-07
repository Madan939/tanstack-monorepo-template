import * as Joi from "joi"

const strongSecret = (min = 32) =>
  Joi.string()
    .min(min)
    .required()
    .custom((value) => {
      if (/change[-_ ]?me|example|secret/i.test(value)) {
        throw new Error("appears to be a placeholder - generate a real secret")
      }
      return value
    }, "non-placeholder secret")

/**
 * Fails fast at boot on misconfiguration. Secrets must differ so that a leak
 * of one cannot be used to forge the other token type.
 */
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid("development", "test", "production").default("development"),
  PORT: Joi.number().port().default(3000),
  LOG_LEVEL: Joi.string().valid("fatal", "error", "warn", "info", "debug", "trace").default("info"),

  // Comma-separated list of allowed CORS origins (no trailing slash).
  CORS_ORIGINS: Joi.string().when("NODE_ENV", {
    is: "production",
    // biome-ignore lint/suspicious/noThenProperty: Joi conditional schema keyword.
    then: Joi.string().min(1).required(),
    otherwise: Joi.string().default("http://localhost:3000,http://localhost:5173"),
  }),
  // Enable when behind a reverse proxy / load balancer so client IPs
  // (rate limiting keys, audit logs) resolve correctly.
  TRUST_PROXY: Joi.boolean().default(false),

  // Swagger UI at /docs. Opt-in for production, always on otherwise.
  SWAGGER_ENABLED: Joi.boolean().when("NODE_ENV", {
    is: "production",
    // biome-ignore lint/suspicious/noThenProperty: Joi conditional schema keyword.
    then: Joi.boolean().default(false),
    otherwise: Joi.boolean().default(true),
  }),

  DATABASE_URL: Joi.string()
    .uri({ scheme: ["postgresql", "postgres"] })
    .required(),

  JWT_ACCESS_SECRET: strongSecret(),
  JWT_ACCESS_TTL: Joi.number().integer().min(60).max(3600).default(900), // 15 min
  JWT_REFRESH_SECRET: strongSecret().invalid(Joi.ref("JWT_ACCESS_SECRET")),
  JWT_REFRESH_TTL: Joi.number().integer().min(600).max(2592000).default(604800), // 7 days

  COOKIE_DOMAIN: Joi.string().domain().allow("").default(""),

  // Base URL used in links inside transactional emails.
  APP_URL: Joi.string()
    .pattern(/^https?:\/\/[^\s]+$/i, "absolute http(s) URL")
    .required(),
  MAIL_FROM: Joi.string().required(),
  // Optional BCC for business copy (e.g., founder@company.com). Empty = no BCC.
  BCC_BUSINESS_EMAIL: Joi.string().email().allow("").default(""),
  // Resend API key (https://resend.com). When empty, emails are rendered to
  // the application log instead of being sent (development / CI).
  RESEND_API_KEY: Joi.string().pattern(/^re_/, "Resend key (re_...)").allow("").default(""),

  // Requests per minute per IP for the global throttler.
  RATE_LIMIT_GLOBAL_MAX: Joi.number().integer().min(1).default(100),
  // Requests per minute per IP for sensitive auth endpoints.
  AUTH_RATE_LIMIT_MAX: Joi.number().integer().min(1).default(10),
  LOCKOUT_MAX_ATTEMPTS: Joi.number().integer().min(3).default(5),
  LOCKOUT_TTL_MINUTES: Joi.number().integer().min(1).default(15),
  EMAIL_VERIFICATION_TTL_HOURS: Joi.number().integer().min(1).default(24),
  EMAIL_VERIFICATION_TTL_MINUTES: Joi.number().integer().min(1).max(60).default(10),
  PASSWORD_RESET_TTL_MINUTES: Joi.number().integer().min(5).default(15),
})
