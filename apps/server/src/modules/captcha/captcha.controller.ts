import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import { Throttle } from "@nestjs/throttler"
import type { Request, Response } from "express"
import { Public } from "../../common/decorators/public.decorator"
import { MessageResponseDto } from "../../common/dto/message-response.dto"
import { CaptchaService } from "./captcha.service"
import { VerifyCaptchaDto } from "./dto/verify-captcha.dto"

const captchaThrottle = () =>
  Throttle({
    default: { limit: Number(process.env.AUTH_RATE_LIMIT_MAX) || 10, ttl: 60_000 },
  })

@ApiTags("captcha")
@Controller("turnstile")
export class CaptchaController {
  constructor(private readonly captchaService: CaptchaService) {}

  @Public()
  @Get("config")
  @ApiOperation({ summary: "Get Turnstile site key and enabled flag" })
  @ApiResponse({ status: HttpStatus.OK, description: "Returns siteKey and enabled" })
  config() {
    return {
      enabled: this.captchaService.isEnabled(),
      siteKey: this.captchaService.getSiteKey(),
    }
  }

  @Public()
  @Post("verify")
  @HttpCode(HttpStatus.OK)
  @captchaThrottle()
  @ApiOperation({
    summary: "Verify Cloudflare Turnstile token",
    description:
      "Validates the Turnstile response token via Cloudflare siteverify. Used as a gate before auth.",
  })
  @ApiResponse({ status: HttpStatus.OK, description: "Captcha verified", type: MessageResponseDto })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Invalid or missing token" })
  async verify(
    @Body() dto: VerifyCaptchaDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<MessageResponseDto> {
    const ip = req.ip
    const result = await this.captchaService.verify(dto.token, ip)

    if (!result.success) {
      throw new BadRequestException(result.message ?? "captcha verification failed")
    }

    // Set short-lived verified flag for server-side checks (5 min)
    res.cookie("captcha_verified", "1", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 5 * 60 * 1000,
    })

    return { message: "captcha verified" }
  }
}
