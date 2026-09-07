import { createHash, timingSafeEqual } from "node:crypto"
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common"
import type { Request } from "express"
import { AppConfigService } from "../../config/app-config.service"

/**
 * CSRF protection for endpoints authenticated via cookies only
 * (`POST /auth/refresh`, `POST /auth/logout`).
 *
 * Implements the double-submit cookie pattern: the client must echo the
 * non-httpOnly `csrf_token` cookie back in the `x-csrf-token` header. A
 * cross-site attacker can neither read the cookie nor set a custom header
 * without triggering a CORS preflight. Combined with `SameSite=strict`
 * refresh cookies this gives defense in depth.
 *
 * Routes that use Bearer access tokens are inherently CSRF-immune and do not
 * need this guard.
 */
@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private readonly appConfig: AppConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>()
    if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return true

    const name = this.appConfig.config.cookies.csrfTokenName
    const cookieToken = request.cookies?.[name]
    const headerToken = request.headers["x-csrf-token"]

    if (typeof cookieToken !== "string" || typeof headerToken !== "string") {
      throw new ForbiddenException("CSRF validation failed")
    }
    if (!safeEqual(cookieToken, headerToken)) {
      throw new ForbiddenException("CSRF validation failed")
    }
    return true
  }
}

/** Length-safe constant-time string comparison. */
function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest()
  const hb = createHash("sha256").update(b).digest()
  return timingSafeEqual(ha, hb)
}
