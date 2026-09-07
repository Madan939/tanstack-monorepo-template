import { randomUUID } from "node:crypto"
import type { Params } from "nestjs-pino"

const SENSITIVE_BODY_FIELDS = [
  "password",
  "currentPassword",
  "newPassword",
  "token",
  "refreshToken",
  "accessToken",
  "csrfToken",
]

/** Structured request logging with secret redaction and request ids. */
export const pinoLoggerOptionsFactory = (): Params => {
  const isProd = process.env.NODE_ENV === "production"

  return {
    pinoHttp: {
      level: process.env.LOG_LEVEL ?? "info",
      // Propagate/issue correlation ids for tracing and error responses.
      genReqId: (req, res) => {
        const incoming = req.headers["x-request-id"]
        const id =
          typeof incoming === "string" && incoming.length > 0 && incoming.length <= 128
            ? incoming
            : randomUUID()
        res.setHeader("x-request-id", id)
        return id
      },
      redact: {
        paths: [
          "req.headers.authorization",
          "req.headers.cookie",
          "res.headers['set-cookie']",
          ...SENSITIVE_BODY_FIELDS.flatMap((f) => [`req.body.${f}`, `req.body.*.${f}`]),
        ],
        censor: "[REDACTED]",
      },
      autoLogging: {
        ignore: (req) => req.url === "/health" || req.url === "/health/",
      },
      customProps: () => ({ context: "HTTP" }),
      ...(isProd
        ? {}
        : { transport: { target: "pino-pretty", options: { singleLine: true, colorize: true } } }),
    },
  }
}
