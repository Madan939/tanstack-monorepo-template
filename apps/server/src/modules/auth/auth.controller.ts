import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from "@nestjs/common"
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiHeaders,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger"
import { Throttle } from "@nestjs/throttler"
import type { Request, Response } from "express"
import { ApiErrors } from "../../common/decorators/api-errors.decorator"
import { AuthenticatedUser, CurrentUser } from "../../common/decorators/current-user.decorator"
import { Public } from "../../common/decorators/public.decorator"
import { MessageResponseDto } from "../../common/dto/message-response.dto"
import { CsrfGuard } from "../../common/guards/csrf.guard"
import { AppConfigService } from "../../config/app-config.service"
import { AuthService } from "./auth.service"
import { AuthSessionResponseDto } from "./dto/auth-session-response.dto"
import { ChangePasswordDto } from "./dto/change-password.dto"
import { ForgotPasswordDto } from "./dto/forgot-password.dto"
import { LoginDto } from "./dto/login.dto"
import { LogoutAllResponseDto } from "./dto/logout-all-response.dto"
import { RegisterDto } from "./dto/register.dto"
import { ResendVerificationDto } from "./dto/resend-verification.dto"
import { ResetPasswordDto } from "./dto/reset-password.dto"
import { VerifyEmailDto } from "./dto/verify-email.dto"
import { SessionMeta } from "./session.service"

/** Stricter per-minute limit for sensitive auth endpoints (per IP). */
export const authThrottle = () =>
  Throttle({
    default: { limit: Number(process.env.AUTH_RATE_LIMIT_MAX) || 10, ttl: 60_000 },
  })

const CSRF_HEADER_DOCS = [
  {
    name: "x-csrf-token",
    required: true,
    description:
      "Value of the readable csrf_token cookie (double-submit pattern). A cross-site attacker can neither read the cookie nor set this header.",
  },
]

const SET_COOKIE_HEADER_DOCS = {
  "Set-Cookie": {
    description:
      "Sets `refresh_token` (httpOnly, SameSite=strict, path=/auth) and `csrf_token` (readable by JS).",
    schema: { type: "string" },
  },
} as const

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly appConfig: AppConfigService,
  ) {}

  @Public()
  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @authThrottle()
  @ApiOperation({
    summary: "Create a new account",
    description:
      "Registers a user and emails a verification link. The response is identical for fresh registrations and duplicate emails so accounts cannot be enumerated; duplicates with unverified addresses receive a fresh verification email instead.",
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Registration accepted. Check your inbox for the verification link.",
    type: MessageResponseDto,
  })
  @ApiErrors(
    [HttpStatus.BAD_REQUEST, "Request body failed validation."],
    [HttpStatus.TOO_MANY_REQUESTS, "Per-IP rate limit for auth endpoints exceeded."],
  )
  async register(@Body() dto: RegisterDto): Promise<MessageResponseDto> {
    return this.authService.register(dto)
  }

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @authThrottle()
  @ApiOperation({
    summary: "Sign in with email and password",
    description:
      "Returns a short-lived JWT access token plus a rotating refresh token stored in a httpOnly cookie. Brute-force attempts trigger progressive account lockout. Also sets an httpOnly admin_access_token cookie for server-side auth.",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Authenticated. Also sets the refresh, CSRF and admin_access_token cookies.",
    type: AuthSessionResponseDto,
    headers: SET_COOKIE_HEADER_DOCS,
  })
  @ApiErrors(
    [HttpStatus.BAD_REQUEST, "Request body failed validation."],
    [HttpStatus.UNAUTHORIZED, "Unknown account, deactivated account or wrong password."],
    [HttpStatus.FORBIDDEN, "Email address is not verified."],
    [
      HttpStatus.LOCKED,
      "Account temporarily locked after too many failed sign-in attempts (revealed only for correct credentials).",
    ],
    [HttpStatus.TOO_MANY_REQUESTS, "Per-IP rate limit for auth endpoints exceeded."],
  )
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthSessionResponseDto> {
    const result = await this.authService.login(dto, this.metaFrom(req))
    this.setAuthCookies(res, result.refreshToken, result.csrfToken, result.accessToken, result.expiresIn)
    // Refresh token lives only in the httpOnly cookie - never in the body.
    return this.authResponseBody(result)
  }

  /**
   * Rotates the refresh token. Authenticated purely via the httpOnly cookie,
   * therefore protected by CsrfGuard (double-submit token).
   */
  @Public()
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @UseGuards(CsrfGuard)
  @ApiCookieAuth("refresh-cookie")
  @ApiHeaders(CSRF_HEADER_DOCS)
  @ApiOperation({
    summary: "Rotate refresh token / renew session",
    description:
      "Exchanges the httpOnly refresh_token cookie for a brand-new token pair. Replaying an already-rotated token revokes the entire session family (theft detection).",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Session renewed. The previous refresh token is now invalid.",
    type: AuthSessionResponseDto,
    headers: SET_COOKIE_HEADER_DOCS,
  })
  @ApiErrors(
    [HttpStatus.UNAUTHORIZED, "Missing, invalid, expired or replayed refresh token."],
    [
      HttpStatus.FORBIDDEN,
      "CSRF validation failed - x-csrf-token must match the csrf_token cookie.",
    ],
  )
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthSessionResponseDto> {
    const refreshToken = req.cookies?.[this.appConfig.config.cookies.refreshTokenName]
    const result = await this.authService.refresh(refreshToken, this.metaFrom(req))
    this.setAuthCookies(res, result.refreshToken, result.csrfToken, result.accessToken, result.expiresIn)
    return this.authResponseBody(result)
  }

  /** Revokes the session tied to the presented refresh cookie. */
  @Public()
  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @UseGuards(CsrfGuard)
  @ApiCookieAuth("refresh-cookie")
  @ApiHeaders(CSRF_HEADER_DOCS)
  @ApiOperation({
    summary: "Revoke the current session",
    description:
      "Revokes the refresh token carried by the httpOnly cookie and clears both cookies. Always succeeds so it cannot be used to probe token validity.",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Signed out; cookies cleared.",
    type: MessageResponseDto,
  })
  @ApiErrors([HttpStatus.FORBIDDEN, "CSRF validation failed."])
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<MessageResponseDto> {
    await this.authService.logout(req.cookies?.[this.appConfig.config.cookies.refreshTokenName])
    this.clearAuthCookies(res)
    return { message: "Signed out" }
  }

  /** Revokes every active session of the authenticated user. */
  @Post("logout-all")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth("access-token")
  @ApiOperation({
    summary: "Revoke all sessions",
    description:
      "Signs out every device by revoking all active sessions of the authenticated user. Also clears auth cookies on the current device.",
  })
  @ApiResponse({ status: HttpStatus.OK, type: LogoutAllResponseDto })
  @ApiErrors([HttpStatus.UNAUTHORIZED, "Missing or invalid access token."])
  async logoutAll(
    @CurrentUser() user: AuthenticatedUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LogoutAllResponseDto> {
    const result = await this.authService.logoutAll(user.sub)
    this.clearAuthCookies(res)
    return result
  }

  /** Changes the password of the authenticated user; revokes all sessions. */
  @Post("change-password")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth("access-token")
  @ApiOperation({
    summary: "Change password (authenticated)",
    description:
      "Verifies the current password, stores the new hash and revokes every session (including the current one), forcing re-login on all devices. Clears auth cookies so the caller is signed out.",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Password updated; all sessions revoked.",
    type: MessageResponseDto,
  })
  @ApiErrors(
    [HttpStatus.BAD_REQUEST, "New password equals the current one, or failed validation."],
    [HttpStatus.UNAUTHORIZED, "Current password is incorrect."],
  )
  async changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ChangePasswordDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<MessageResponseDto> {
    const result = await this.authService.changePassword(user.sub, dto)
    this.clearAuthCookies(res)
    return result
  }

  @Public()
  @Post("verify-email")
  @HttpCode(HttpStatus.OK)
  @authThrottle()
  @ApiOperation({
    summary: "Verify an email address with 6-digit code",
    description: "Consumes a single-use 6-digit code delivered by email. Code expires in 10 minutes.",
  })
  @ApiResponse({ status: HttpStatus.OK, description: "Email verified.", type: MessageResponseDto })
  @ApiErrors(
    [HttpStatus.BAD_REQUEST, "Invalid, expired or already-used verification code."],
    [HttpStatus.TOO_MANY_REQUESTS, "Rate limit exceeded."],
  )
  verifyEmail(@Body() dto: VerifyEmailDto): Promise<MessageResponseDto> {
    return this.authService.verifyEmail(dto.email, dto.code)
  }

  @Public()
  @Post("resend-verification")
  @HttpCode(HttpStatus.OK)
  @authThrottle()
  @ApiOperation({
    summary: "Resend the verification email",
    description: "Response is generic whether or not the account exists (no enumeration).",
  })
  @ApiResponse({ status: HttpStatus.OK, type: MessageResponseDto })
  @ApiErrors([HttpStatus.TOO_MANY_REQUESTS, "Rate limit exceeded."])
  resendVerification(@Body() dto: ResendVerificationDto): Promise<MessageResponseDto> {
    return this.authService.resendVerification(dto.email)
  }

  @Public()
  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  @authThrottle()
  @ApiOperation({
    summary: "Request a password-reset link",
    description:
      "Sends a single-use reset link if the account exists; the response is always generic.",
  })
  @ApiResponse({ status: HttpStatus.OK, type: MessageResponseDto })
  @ApiErrors([HttpStatus.TOO_MANY_REQUESTS, "Rate limit exceeded."])
  forgotPassword(@Body() dto: ForgotPasswordDto): Promise<MessageResponseDto> {
    return this.authService.forgotPassword(dto.email)
  }

  @Public()
  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  @authThrottle()
  @ApiOperation({
    summary: "Reset password with emailed token",
    description:
      "Consumes a single-use reset token, sets the new password, marks the email verified and revokes all sessions so stolen cookies become useless.",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Password reset; sign in again on all devices.",
    type: MessageResponseDto,
  })
  @ApiErrors(
    [HttpStatus.BAD_REQUEST, "Invalid, expired or already-used reset token."],
    [HttpStatus.TOO_MANY_REQUESTS, "Rate limit exceeded."],
  )
  resetPassword(@Body() dto: ResetPasswordDto): Promise<MessageResponseDto> {
    return this.authService.resetPassword(dto)
  }

  // -- helpers ---------------------------------------------------------------

  /** Body returned to the client - refresh token is cookie-only. */
  private authResponseBody(result: {
    user: AuthSessionResponseDto["user"]
    accessToken: string
    expiresIn: number
    csrfToken: string
  }): AuthSessionResponseDto {
    return {
      user: result.user,
      accessToken: result.accessToken,
      expiresIn: result.expiresIn,
      csrfToken: result.csrfToken,
    }
  }

  private metaFrom(req: Request): SessionMeta {
    return {
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip,
    }
  }

  private setAuthCookies(
    res: Response,
    refreshToken: string,
    csrfToken: string,
    accessToken?: string,
    expiresIn?: number,
  ): void {
    const cfg = this.appConfig.config.cookies
    const refreshMaxAge = this.appConfig.config.jwt.refreshTtlSeconds * 1000

    // Refresh token: inaccessible to JavaScript, scoped to /auth endpoints.
    res.cookie(cfg.refreshTokenName, refreshToken, {
      httpOnly: true,
      secure: cfg.secure,
      sameSite: "strict",
      domain: cfg.domain,
      path: "/auth",
      maxAge: refreshMaxAge,
    })
    // CSRF token: readable by the client so it can echo it back as a header.
    res.cookie(cfg.csrfTokenName, csrfToken, {
      httpOnly: false,
      secure: cfg.secure,
      sameSite: "strict",
      domain: cfg.domain,
      path: "/",
      maxAge: refreshMaxAge,
    })
    // Access token: httpOnly so SSR guards can read it; mirrors login behavior on refresh.
    if (accessToken && expiresIn) {
      res.cookie(cfg.accessTokenName, accessToken, {
        httpOnly: true,
        secure: cfg.secure,
        sameSite: "strict",
        domain: cfg.domain,
        path: "/",
        maxAge: expiresIn * 1000,
      })
    }
  }

  private clearAuthCookies(res: Response): void {
    const cfg = this.appConfig.config.cookies
    // Must mirror the attributes used in setAuthCookies/login so browsers actually delete the cookies.
    res.clearCookie(cfg.refreshTokenName, {
      domain: cfg.domain,
      path: "/auth",
      httpOnly: true,
      secure: cfg.secure,
      sameSite: "strict",
    })
    res.clearCookie(cfg.csrfTokenName, {
      domain: cfg.domain,
      path: "/",
      secure: cfg.secure,
      sameSite: "strict",
    })
    res.clearCookie(cfg.accessTokenName, {
      domain: cfg.domain,
      path: "/",
      httpOnly: true,
      secure: cfg.secure,
      sameSite: "strict",
    })
  }
}
