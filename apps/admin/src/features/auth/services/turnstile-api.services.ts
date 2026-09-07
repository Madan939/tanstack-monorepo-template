import { type AxiosRequestConfig, BaseApiService } from "@workspace/api-client"
import { CONFIG } from "#/config"
import { apiClient } from "#/lib/api-client"
import type { TurnstileConfigQuery, TurnstileVerifyMutation } from "../types"

class TurnstileApiService extends BaseApiService {
  constructor() {
    super(apiClient)
  }

  async getConfig(config?: AxiosRequestConfig): Promise<TurnstileConfigQuery.AxiosResponse> {
    return super.get<TurnstileConfigQuery.Response, TurnstileConfigQuery.AxiosResponse>(CONFIG.ENDPOINTS.TURNSTILE.CONFIG, config)
  }

  async verify(data: TurnstileVerifyMutation.Payload, config?: AxiosRequestConfig): Promise<TurnstileVerifyMutation.AxiosResponse> {
    return super.post<TurnstileVerifyMutation.Response, TurnstileVerifyMutation.AxiosResponse, TurnstileVerifyMutation.Payload>(
      CONFIG.ENDPOINTS.TURNSTILE.VERIFY,
      data,
      config,
    )
  }
}

export const turnstileApiService = new TurnstileApiService()
