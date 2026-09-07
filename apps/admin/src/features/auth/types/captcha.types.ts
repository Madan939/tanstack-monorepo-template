import type { ApiResponse } from "@workspace/api-client"

export type TurnstileConfigResponse = {
  enabled: boolean
  siteKey: string
}

export type TurnstileVerifyPayload = {
  token: string
}

export type TurnstileVerifyResponse = {
  message?: string
}

export namespace TurnstileConfigQuery {
  export type Response = TurnstileConfigResponse
  export type AxiosResponse = ApiResponse<Response>
}

export namespace TurnstileVerifyMutation {
  export type Payload = TurnstileVerifyPayload
  export type Response = TurnstileVerifyResponse
  export type AxiosResponse = ApiResponse<Response>
}
