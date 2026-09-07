import type { APIError, ApiResponse } from "@workspace/api-client"
import type { FieldError } from "@workspace/form"
import type { OnboardingSchema } from "../schemas"
import type { PublicUser } from "./public-user.types"

export namespace OnboardingMutation {
  export type Payload = OnboardingSchema
  export type Response = PublicUser
  export type AxiosResponse = ApiResponse<Response>
  export type ErrorResponse = APIError<FieldError<OnboardingSchema>>
}
