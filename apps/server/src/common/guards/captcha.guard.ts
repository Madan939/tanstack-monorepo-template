import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common"
import type { Request } from "express"
import { AppConfigService } from "../../config/app-config.service"

/**
 * Guard that enforces solved Captcha verification when Turnstile is enabled.
 * Checks for the `captcha_verified` cookie set by `POST /turnstile/verify`.
 */
@Injectable()
export class CaptchaGuard implements CanActivate {
  constructor(private readonly appConfig: AppConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const isEnabled = this.appConfig.config.turnstile?.enabled ?? false
    if (!isEnabled) {
      return true
    }

    const request = context.switchToHttp().getRequest<Request>()
    const isVerified = request.cookies?.captcha_verified === "1"

    if (!isVerified) {
      throw new ForbiddenException("Captcha verification required")
    }

    return true
  }
}
