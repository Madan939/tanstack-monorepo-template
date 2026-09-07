import { useMutation } from "@workspace/query"
import { toast } from "@workspace/ui"
import { authApiService } from "../../services"
import type { VerifyEmailMutation } from "../../types"

export function useVerifyEmailMutation() {
  return useMutation<VerifyEmailMutation.AxiosResponse, VerifyEmailMutation.ErrorResponse, VerifyEmailMutation.Payload>(
    (data) => authApiService.verifyEmail(data),
    {
      onSuccess: (response) => {
        toast.success(response.data.message)
      },
      onError: (error: VerifyEmailMutation.ErrorResponse) => {
        const rawMessage = error.response?.data?.message
        const message = Array.isArray(rawMessage) ? rawMessage.join(", ") : (rawMessage ?? error.response?.data?.error ?? error.message)
        toast.error(message ?? "Verification failed")
      },
    },
  )
}
