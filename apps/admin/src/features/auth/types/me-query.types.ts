import type { APIError, ApiResponse } from "@workspace/api-client"
import type { PublicUser } from "./public-user.types"

export namespace MeQuery {
  export type Response = PublicUser
  export type AxiosResponse = ApiResponse<Response>
  export type ErrorResponse = APIError
}
