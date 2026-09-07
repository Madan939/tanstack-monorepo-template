import { ExecutionContext, ForbiddenException } from "@nestjs/common"
import { AppConfigService } from "../../config/app-config.service"
import { CaptchaGuard } from "./captcha.guard"

describe("CaptchaGuard", () => {
  let guard: CaptchaGuard
  let appConfig: jest.Mocked<AppConfigService>

  const createMockContext = (cookies: Record<string, string> = {}): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ cookies }),
      }),
    }) as unknown as ExecutionContext

  beforeEach(() => {
    appConfig = {
      config: {
        turnstile: {
          enabled: false,
          secretKey: "",
          siteKey: "",
        },
      },
    } as unknown as jest.Mocked<AppConfigService>

    guard = new CaptchaGuard(appConfig)
  })

  it("should allow access when Turnstile is disabled", () => {
    const context = createMockContext({})
    expect(guard.canActivate(context)).toBe(true)
  })

  it("should allow access when Turnstile is enabled and captcha_verified cookie is 1", () => {
    appConfig.config.turnstile = { enabled: true, secretKey: "sec", siteKey: "site" }
    const context = createMockContext({ captcha_verified: "1" })
    expect(guard.canActivate(context)).toBe(true)
  })

  it("should throw ForbiddenException when Turnstile is enabled and cookie is missing", () => {
    appConfig.config.turnstile = { enabled: true, secretKey: "sec", siteKey: "site" }
    const context = createMockContext({})
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException)
  })

  it("should throw ForbiddenException when Turnstile is enabled and cookie value is invalid", () => {
    appConfig.config.turnstile = { enabled: true, secretKey: "sec", siteKey: "site" }
    const context = createMockContext({ captcha_verified: "0" })
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException)
  })
})
