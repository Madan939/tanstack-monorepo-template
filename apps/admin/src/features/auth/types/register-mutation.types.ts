import type { APIError, ApiResponse } from "@workspace/api-client"
import type { FieldError } from "@workspace/form"
import type { RegisterSchema } from "../schemas"
import type { MessageResponseDto } from "./message-response.types"

export namespace RegisterMutation {
  export type Payload = RegisterSchema
  export type Response = MessageResponseDto
  export type AxiosResponse = ApiResponse<Response>
  export type ErrorResponse = APIError<FieldError<RegisterSchema>>
}
