import { Module } from "@nestjs/common"
import { CaptchaGuard } from "../../common/guards/captcha.guard"
import { CaptchaController } from "./captcha.controller"
import { CaptchaService } from "./captcha.service"

@Module({
  controllers: [CaptchaController],
  providers: [CaptchaService, CaptchaGuard],
  exports: [CaptchaService, CaptchaGuard],
})
export class CaptchaModule {}
