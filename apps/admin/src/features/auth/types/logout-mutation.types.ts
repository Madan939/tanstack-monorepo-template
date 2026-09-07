import type { APIError, ApiResponse } from "@workspace/api-client"
import type { MessageResponseDto } from "./message-response.types"

export namespace LogoutMutation {
  export type Payload = void
  export type Response = MessageResponseDto
  export type AxiosResponse = ApiResponse<Response>
  export type ErrorResponse = APIError
}

export namespace LogoutAllMutation {
  export type Payload = void
  export type Response = { revokedSessions: number }
  export type AxiosResponse = ApiResponse<Response>
  export type ErrorResponse = APIError
}
