import { readFileSync } from "node:fs"
import type { INestApplication } from "@nestjs/common"
import { DocumentBuilder, type OpenAPIObject, SwaggerModule } from "@nestjs/swagger"
import type { AppConfig } from "../../config/configuration"

const DOCS_PATH = "docs"

/** Reads the API version from package.json so the spec never drifts from the build. */
function readApiVersion(): string {
  try {
    const pkg = JSON.parse(readFileSync("package.json", "utf8")) as { version?: string }
    return pkg.version ?? "0.0.1"
  } catch {
    return "0.0.1"
  }
}

/**
 * Base OpenAPI configuration. Security scheme names are referenced by name
 * from controller decorators:
 *
 * - "access-token"   -> @ApiBearerAuth("access-token")
 * - "refresh-cookie" -> @ApiCookieAuth("refresh-cookie")
 */
export function openApiOptions(config: AppConfig) {
  return new DocumentBuilder()
    .setTitle("Auth Service API")
    .setVersion(readApiVersion())
    .setDescription(
      [
        "Authentication and user-management service (NestJS + PostgreSQL + Prisma).",
        "",
        "## Authentication model",
        "1. `POST /auth/login` returns a short-lived **JWT access token** and sets two cookies:",
        "   a httpOnly `refresh_token` cookie scoped to `/auth`, and a JS-readable `csrf_token` cookie.",
        "2. Protected endpoints expect `Authorization: Bearer <accessToken>` - use the Authorize button above.",
        "3. `POST /auth/refresh` and `POST /auth/logout` authenticate via the refresh cookie only and",
        "   additionally require the double-submit header `x-csrf-token` echoing the `csrf_token` cookie.",
        "",
        "## Conventions",
        "- Every error uses one uniform envelope:",
        "  `{ statusCode, message, error?, path, requestId?, timestamp }`.",
        "- The correlation id is echoed back in the `x-request-id` response header.",
        "- Sensitive endpoints are rate limited per IP; exceeding the limit yields HTTP 429.",
      ].join("\n"),
    )
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description:
          "Short-lived JWT access token obtained from POST /auth/login or POST /auth/refresh.",
      },
      "access-token",
    )
    .addCookieAuth(
      config.cookies.refreshTokenName,
      {
        type: "apiKey",
        in: "cookie",
        description:
          "httpOnly rotating refresh token scoped to /auth. Browsers attach it automatically; it cannot be set manually.",
      },
      "refresh-cookie",
    )
    .addTag("auth", "Registration, sessions, password and email-verification flows.")
    .addTag("user", "Profile access.")
    .addTag("health", "Liveness / readiness probes.")
    .build()
}

export function createOpenApiDocument(app: INestApplication, config: AppConfig): OpenAPIObject {
  return SwaggerModule.createDocument(app, openApiOptions(config))
}

/** Mounts Swagger UI at /docs. Called from main.ts when config.swaggerEnabled. */
export function setupOpenApi(app: INestApplication, config: AppConfig): void {
  const document = createOpenApiDocument(app, config)
  SwaggerModule.setup(DOCS_PATH, app, document, {
    customSiteTitle: `${document.info.title} · Docs`,
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      tagsSorter: "alpha",
      operationsSorter: "alpha",
    },
  })
}
