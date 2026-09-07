import { useMutation } from "@workspace/query"
import { toast } from "@workspace/ui"
import { authApiService } from "../../services"
import type { ForgotPasswordMutation } from "../../types"

export function useForgotPasswordMutation() {
  return useMutation<
    ForgotPasswordMutation.AxiosResponse,
    ForgotPasswordMutation.ErrorResponse,
    ForgotPasswordMutation.Payload
  >(
    (variables) => authApiService.forgotPassword(variables),
    {
      onSuccess: (response) => {
        toast.success(response.data.message)
      },
      onError: (error: ForgotPasswordMutation.ErrorResponse) => {
        const rawMessage = error.response?.data?.message
        const message = Array.isArray(rawMessage) ? rawMessage.join(", ") : (rawMessage ?? error.response?.data?.error ?? error.message)
        toast.error(message ?? "Failed to send reset link")
      },
    },
  )
}
