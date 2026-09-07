import { useNavigate } from "@tanstack/react-router"
import { useMutation } from "@workspace/query"
import { toast } from "@workspace/ui"
import { authApiService } from "../../services"
import type { ResetPasswordMutation } from "../../types"

export function useResetPasswordMutation() {
  const navigate = useNavigate()
  return useMutation<ResetPasswordMutation.AxiosResponse, ResetPasswordMutation.ErrorResponse, ResetPasswordMutation.Payload>(
    (payload) => authApiService.resetPassword(payload),
    {
      onSuccess: (response) => {
        toast.success(response.data.message)
        void navigate({ to: "/auth/login" })
      },
      onError: (error: ResetPasswordMutation.ErrorResponse) => {
        const rawMessage = error.response?.data?.message
        const message = Array.isArray(rawMessage) ? rawMessage.join(", ") : (rawMessage ?? error.response?.data?.error ?? error.message)
        toast.error(message ?? "Failed to reset password")
      },
    },
  )
}
