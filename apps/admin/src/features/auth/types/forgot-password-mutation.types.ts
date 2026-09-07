import type { APIError, ApiResponse } from "@workspace/api-client"
import type { FieldError } from "@workspace/form"
import type { ForgotPasswordSchema } from "../schemas"
import type { MessageResponseDto } from "./message-response.types"

export namespace ForgotPasswordMutation {
  export type Payload = ForgotPasswordSchema
  export type Response = MessageResponseDto
  export type AxiosResponse = ApiResponse<Response>
  export type ErrorResponse = APIError<FieldError<ForgotPasswordSchema>>
}
