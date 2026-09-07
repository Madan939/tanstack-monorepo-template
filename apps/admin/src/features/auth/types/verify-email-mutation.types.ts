import type { APIError, ApiResponse } from "@workspace/api-client"
import type { FieldError } from "@workspace/form"
import type { ResendVerificationSchema, VerifyEmailSchema } from "../schemas"
import type { MessageResponseDto } from "./message-response.types"

export namespace VerifyEmailMutation {
  export type Payload = VerifyEmailSchema
  export type Response = MessageResponseDto
  export type AxiosResponse = ApiResponse<Response>
  export type ErrorResponse = APIError<FieldError<VerifyEmailSchema>>
}

export namespace ResendVerificationMutation {
  export type Payload = ResendVerificationSchema
  export type Response = MessageResponseDto
  export type AxiosResponse = ApiResponse<Response>
  export type ErrorResponse = APIError<FieldError<ResendVerificationSchema>>
}
