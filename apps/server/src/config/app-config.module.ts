import { Global, Module } from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { AppConfigService } from "./app-config.service"
import { CONFIG, configFactory } from "./configuration"

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: CONFIG,
      inject: [ConfigService],
      useFactory: configFactory,
    },
    AppConfigService,
  ],
  exports: [CONFIG, AppConfigService],
})
export class AppConfigModule {}
