import { type AxiosRequestConfig, BaseApiService } from "@workspace/api-client"
import { CONFIG } from "#/config"
import { apiClient } from "#/lib/api-client"
import type {
  ForgotPasswordMutation,
  LoginMutation,
  LogoutAllMutation,
  LogoutMutation,
  MeQuery,
  OnboardingMutation,
  RegisterMutation,
  ResendVerificationMutation,
  ResetPasswordMutation,
  VerifyEmailMutation,
} from "../types"

class AuthApiService extends BaseApiService {
  constructor() {
    super(apiClient)
  }

  async login(data: LoginMutation.Payload, config?: AxiosRequestConfig): Promise<LoginMutation.AxiosResponse> {
    return super.post<LoginMutation.Response, LoginMutation.AxiosResponse, LoginMutation.Payload>(CONFIG.ENDPOINTS.AUTH.LOGIN, data, config)
  }

  async register(data: RegisterMutation.Payload, config?: AxiosRequestConfig): Promise<RegisterMutation.AxiosResponse> {
    return super.post<RegisterMutation.Response, RegisterMutation.AxiosResponse, RegisterMutation.Payload>(CONFIG.ENDPOINTS.AUTH.REGISTER, data, config)
  }

  async forgotPassword(data: ForgotPasswordMutation.Payload, config?: AxiosRequestConfig): Promise<ForgotPasswordMutation.AxiosResponse> {
    return super.post<ForgotPasswordMutation.Response, ForgotPasswordMutation.AxiosResponse, ForgotPasswordMutation.Payload>(
      CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD,
      data,
      config,
    )
  }

  async resetPassword(data: ResetPasswordMutation.Payload, config?: AxiosRequestConfig): Promise<ResetPasswordMutation.AxiosResponse> {
    return super.post<ResetPasswordMutation.Response, ResetPasswordMutation.AxiosResponse, ResetPasswordMutation.Payload>(
      CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD,
      data,
      config,
    )
  }

  async verifyEmail(data: VerifyEmailMutation.Payload, config?: AxiosRequestConfig): Promise<VerifyEmailMutation.AxiosResponse> {
    return super.post<VerifyEmailMutation.Response, VerifyEmailMutation.AxiosResponse, VerifyEmailMutation.Payload>(
      CONFIG.ENDPOINTS.AUTH.VERIFY_EMAIL,
      data,
      config,
    )
  }

  async resendVerification(data: ResendVerificationMutation.Payload, config?: AxiosRequestConfig): Promise<ResendVerificationMutation.AxiosResponse> {
    return super.post<ResendVerificationMutation.Response, ResendVerificationMutation.AxiosResponse, ResendVerificationMutation.Payload>(
      CONFIG.ENDPOINTS.AUTH.RESEND_VERIFICATION,
      data,
      config,
    )
  }

  async onboarding(data: OnboardingMutation.Payload, config?: AxiosRequestConfig): Promise<OnboardingMutation.AxiosResponse> {
    return super.post<OnboardingMutation.Response, OnboardingMutation.AxiosResponse, OnboardingMutation.Payload>(
      CONFIG.ENDPOINTS.AUTH.ONBOARDING,
      data,
      config,
    )
  }

  async me(config?: AxiosRequestConfig): Promise<MeQuery.AxiosResponse> {
    return super.get<MeQuery.Response, MeQuery.AxiosResponse>(CONFIG.ENDPOINTS.AUTH.ME, config)
  }

  async logout(config?: AxiosRequestConfig): Promise<LogoutMutation.AxiosResponse> {
    return super.post<LogoutMutation.Response, LogoutMutation.AxiosResponse, void>(CONFIG.ENDPOINTS.AUTH.LOGOUT, undefined, config)
  }

  async logoutAll(config?: AxiosRequestConfig): Promise<LogoutAllMutation.AxiosResponse> {
    return super.post<LogoutAllMutation.Response, LogoutAllMutation.AxiosResponse, void>(CONFIG.ENDPOINTS.AUTH.LOGOUT_ALL, undefined, config)
  }
}

export const authApiService = new AuthApiService()
