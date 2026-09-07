import { Module, ValidationPipe } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { APP_FILTER, APP_GUARD, APP_PIPE } from "@nestjs/core"
import { JwtModule } from "@nestjs/jwt"
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler"
import { LoggerModule } from "nestjs-pino"
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter"
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard"
import { AppConfigModule } from "./config/app-config.module"
import { envValidationSchema } from "./config/env.validation"
import { CleanupModule } from "./core/cleanup/cleanup.module"
import { pinoLoggerOptionsFactory } from "./core/logger/logger.options"
import { PrismaModule } from "./core/prisma/prisma.module"
import { AuthModule } from "./modules/auth/auth.module"
import { CaptchaModule } from "./modules/captcha/captcha.module"
import { HealthModule } from "./modules/health/health.module"
import { UsersModule } from "./modules/users/users.module"

@Module({
  imports: [
    // Fail-fast environment validation.
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validationSchema: envValidationSchema,
      validationOptions: { abortEarly: false, allowUnknown: true },
    }),
    LoggerModule.forRootAsync({
      useFactory: pinoLoggerOptionsFactory,
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: "global",
          ttl: 60_000,
          limit: Number(process.env.RATE_LIMIT_GLOBAL_MAX) || 100,
        },
      ],
    }),
    AppConfigModule,
    PrismaModule,
    // Registered at the root so globally-provided JwtAuthGuard can inject it.
    JwtModule.register({}),
    AuthModule,
    CaptchaModule,
    UsersModule,
    HealthModule,
    CleanupModule,
  ],
  providers: [
    // Strict request validation: strip unknown fields, reject extra ones.
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { exposeDefaultValues: true },
      }),
    },
    // Global guards: authentication -> rate limiting.
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
