import { useMutation } from "@workspace/query"
import { authApiService } from "../../services"
import type { VerifyEmailMutation } from "../../types"

export function useVerifyEmailMutation() {
  return useMutation<VerifyEmailMutation.AxiosResponse, VerifyEmailMutation.ErrorResponse, VerifyEmailMutation.Payload>(
    (data) => authApiService.verifyEmail(data),
  )
}
