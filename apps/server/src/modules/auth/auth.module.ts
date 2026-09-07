import { Module } from "@nestjs/common"
import { JwtModule } from "@nestjs/jwt"
import { MailModule } from "../../core/mail/mail.module"
import { AuthController } from "./auth.controller"
import { AuthService } from "./auth.service"
import { SessionService } from "./session.service"
import { TokenService } from "./token.service"

/**
 * JWT signing happens through TokenService (which reads secrets from the
 * validated AppConfig); JwtModule is registered without global options so
 * every sign/verify call passes its own secret explicitly.
 */
@Module({
  imports: [JwtModule.register({}), MailModule],
  controllers: [AuthController],
  providers: [AuthService, SessionService, TokenService],
  exports: [TokenService, SessionService, AuthService],
})
export class AuthModule {}
