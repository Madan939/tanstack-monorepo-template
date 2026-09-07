import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { JwtService } from "@nestjs/jwt"
import { AppConfigService } from "../../config/app-config.service"
import { PrismaService } from "../../core/prisma/prisma.service"
import { AuthenticatedRequest, AuthenticatedUser } from "../decorators/current-user.decorator"
import { IS_PUBLIC_KEY } from "../decorators/public.decorator"

export function extractBearerToken(header?: string): string | null {
  if (!header) return null
  const [scheme, token] = header.split(" ")
  if (scheme?.toLowerCase() !== "bearer" || !token) return null
  return token
}

const ADMIN_ACCESS_TOKEN_COOKIE_FALLBACK = "admin_access_token"

/**
 * Global authentication guard. Every route requires a valid Bearer access
 * token unless decorated with @Public(). The token may be supplied via the
 * `Authorization: Bearer <token>` header *or* via an httpOnly cookie named
 * `admin_access_token` that is set on login.
 *
 * Production hardening: after cryptographic verification we load the user
 * from the database to enforce `isActive` revocation immediately (short-lived
 * JWTs alone cannot be revoked). This prevents disabled accounts from
 * continuing to act until token expiry.
 */
@Injectable()
export class JwtAuthGuard {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    private readonly appConfig: AppConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) return true

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
    const cookieName =
      this.appConfig.config.cookies.accessTokenName ?? ADMIN_ACCESS_TOKEN_COOKIE_FALLBACK
    // Prefer cookie (httpOnly server-side auth) then header for API clients
    const token = request.cookies?.[cookieName] ?? extractBearerToken(request.headers.authorization)
    if (!token) throw new UnauthorizedException("Authentication required")

    let payload: AuthenticatedUser & { iat?: number; exp?: number }
    try {
      payload = await this.jwt.verifyAsync<AuthenticatedUser & { iat?: number; exp?: number }>(
        token,
        {
          secret: this.appConfig.config.jwt.accessSecret,
          algorithms: ["HS256"],
          ignoreExpiration: false,
        },
      )
    } catch {
      throw new UnauthorizedException("Invalid or expired access token")
    }

    // Production: verify user still active in DB; do not trust JWT alone for revocation.
    try {
      const dbUser = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, email: true, emailVerified: true, isActive: true },
      })
      if (!dbUser) throw new UnauthorizedException("Account no longer exists")
      if (!dbUser.isActive) throw new UnauthorizedException("Account has been deactivated")
      request.user = {
        sub: dbUser.id,
        email: dbUser.email,
        emailVerified: dbUser.emailVerified,
        isActive: dbUser.isActive,
      }
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err
      // DB unavailable => fail closed
      throw new UnauthorizedException("Unable to verify account status")
    }

    return true
  }
}
