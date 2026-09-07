import "./load-env"

import { NestFactory } from "@nestjs/core"
import type { NestExpressApplication } from "@nestjs/platform-express"
import cookieParser from "cookie-parser"
import helmet from "helmet"
import { Logger } from "nestjs-pino"
import { AppModule } from "./app.module"
import { AppConfigService } from "./config/app-config.service"
import { setupOpenApi } from "./core/openapi/openapi.options"

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // Buffer logs until the pino logger replaces the default one.
    bufferLogs: true,
  })

  const logger = app.get(Logger)
  app.useLogger(logger)

  const { config } = app.get(AppConfigService)

  // --- security middleware -------------------------------------------------
  app.use(
    helmet({
      contentSecurityPolicy: config.env === "production" ? undefined : false, // API responses only
      crossOriginResourcePolicy: { policy: "same-site" },
      hsts:
        config.env === "production"
          ? { maxAge: 31536000, includeSubDomains: true, preload: true }
          : false,
      noSniff: true,
      referrerPolicy: { policy: "no-referrer" },
    }),
  )
  // Prevent clickjacking: API never renders in an iframe
  app.use(((
    _req: unknown,
    res: { setHeader: (k: string, v: string) => void },
    next: () => void,
  ) => {
    res.setHeader("X-Frame-Options", "DENY")
    next()
  }) as never)
  app.use(cookieParser())

  if (config.trustProxy) {
    // Required so req.ip reflects X-Forwarded-For behind a reverse proxy;
    // rate limiting and audit logs key off the real client IP.
    app.set("trust proxy", 1)
  }

  // Strict CORS allow-list; credentials are required for the refresh cookie.
  app.enableCors({
    origin: config.corsOrigins,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["content-type", "authorization", "x-csrf-token", "x-request-id"],
    exposedHeaders: ["x-request-id"],
    maxAge: 600,
  })

  app.enableShutdownHooks()

  // Interactive OpenAPI documentation (disabled by default in production).
  if (config.swaggerEnabled) {
    setupOpenApi(app, config)
    logger.log(`OpenAPI docs available at /docs (${config.env})`)
  }

  await app.listen(config.port, "0.0.0.0")
  logger.log(`Auth service listening on port ${config.port} (${config.env})`)
}

bootstrap().catch((err) => {
  console.error("Fatal error during bootstrap:", err)
  process.exit(1)
})
