import { createParamDecorator, ExecutionContext } from "@nestjs/common"
import type { Request } from "express"

export interface AuthenticatedUser {
  /** User id. */
  sub: string
  email: string
  /** True when the user has verified their email address. */
  emailVerified?: boolean
  isActive?: boolean
}

/** Express request carrying a verified access-token payload. */
export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser
}

/**
 * Parameter decorator that injects the authenticated user from the verified
 * access-token payload. Only meaningful inside routes guarded by JwtAuthGuard.
 *
 * @example
 * me(@CurrentUser() user: AuthenticatedUser)
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>()
    return request.user as AuthenticatedUser
  },
)
