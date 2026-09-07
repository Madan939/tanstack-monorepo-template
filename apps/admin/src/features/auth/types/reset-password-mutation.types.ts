import type { APIError, ApiResponse } from "@workspace/api-client"
import type { FieldError } from "@workspace/form"
import type { ResetPasswordSchema } from "../schemas"
import type { MessageResponseDto } from "./message-response.types"

export namespace ResetPasswordMutation {
  export type Payload = ResetPasswordSchema
  export type Response = MessageResponseDto
  export type AxiosResponse = ApiResponse<Response>
  export type ErrorResponse = APIError<FieldError<ResetPasswordSchema>>
}
