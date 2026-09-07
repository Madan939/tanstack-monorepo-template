import { Inject, Injectable } from "@nestjs/common"
import { type AppConfig, CONFIG } from "./configuration"

/** Typed accessor for the validated {@link AppConfig}. */
@Injectable()
export class AppConfigService {
  constructor(@Inject(CONFIG) public readonly config: AppConfig) {}
}
