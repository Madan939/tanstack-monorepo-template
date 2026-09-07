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
      onSuccess: (data) => {
        const message = data.data.message
        toast.success(message ?? "Password reset successfully")
        void navigate({ to: "/auth/login" })
      },
      onError: (error: ResetPasswordMutation.ErrorResponse) => {
        const rawMessage = error.response?.data.message
        const message = Array.isArray(rawMessage) ? rawMessage.join(", ") : rawMessage
        toast.error(message ?? error.response?.data.error ?? "Failed to reset password")
      },
    },
  )
}
