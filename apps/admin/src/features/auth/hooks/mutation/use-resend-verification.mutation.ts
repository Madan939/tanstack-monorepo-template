import { useMutation } from "@workspace/query"
import { authApiService } from "../../services"
import type { ResendVerificationMutation } from "../../types"

export function useResendVerificationMutation() {
  return useMutation<
    ResendVerificationMutation.AxiosResponse,
    ResendVerificationMutation.ErrorResponse,
    ResendVerificationMutation.Payload
  >((data) => authApiService.resendVerification(data))
}
