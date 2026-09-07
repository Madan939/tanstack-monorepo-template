import { useMutation } from "@workspace/query"
import { toast } from "@workspace/ui"
import { authApiService } from "../../services"
import type { ResendVerificationMutation } from "../../types"

export function useResendVerificationMutation() {
  return useMutation<
    ResendVerificationMutation.AxiosResponse,
    ResendVerificationMutation.ErrorResponse,
    ResendVerificationMutation.Payload
  >(
    (data) => authApiService.resendVerification(data),
    {
      onSuccess: (response) => {
        toast.success(response.data.message)
      },
      onError: (error: ResendVerificationMutation.ErrorResponse) => {
        const rawMessage = error.response?.data?.message
        const message = Array.isArray(rawMessage) ? rawMessage.join(", ") : (rawMessage ?? error.response?.data?.error ?? error.message)
        toast.error(message ?? "Failed to resend verification")
      },
    },
  )
}
