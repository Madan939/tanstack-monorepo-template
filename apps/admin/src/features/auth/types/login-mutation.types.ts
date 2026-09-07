import type { APIError, ApiResponse } from "@workspace/api-client"
import type { FieldError } from "@workspace/form"
import type { LoginSchema } from "../schemas"
import type { AuthSessionResponseDto } from "./public-user.types"

export namespace LoginMutation {
  export type Payload = LoginSchema
  export type Response = AuthSessionResponseDto
  export type AxiosResponse = ApiResponse<Response>
  export type ErrorResponse = APIError<FieldError<LoginSchema>>
}
