import { useMutation } from "@workspace/query"
import { toast } from "@workspace/ui"
import { authApiService } from "../../services"
import type { RegisterMutation } from "../../types"

export function useRegisterMutation() {
  return useMutation<RegisterMutation.AxiosResponse, RegisterMutation.ErrorResponse, RegisterMutation.Payload>(
    (data) => authApiService.register(data),
    {
      onSuccess: (response) => {
        toast.success(response.data.message)
      },
      onError: (error: RegisterMutation.ErrorResponse) => {
        const rawMessage = error.response?.data?.message
        const message = Array.isArray(rawMessage) ? rawMessage.join(", ") : (rawMessage ?? error.response?.data?.error ?? error.message)
        toast.error(message ?? "Registration failed")
      },
    },
  )
}
