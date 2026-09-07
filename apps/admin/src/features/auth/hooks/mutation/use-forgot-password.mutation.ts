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
      onSuccess: (data) => {
        toast.success(data?.data?.message ?? "Reset link sent", { duration: 5000 })
      },
    },
  )
}
