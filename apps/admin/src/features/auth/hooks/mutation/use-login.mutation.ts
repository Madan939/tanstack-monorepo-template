import { useRouter } from "@tanstack/react-router"
import { useMutation } from "@workspace/query"
import { toast } from "@workspace/ui"
import { authApiService } from "../../services"
import type { LoginMutation } from "../../types"

export function useLoginMutation() {
  const router = useRouter()
  return useMutation<LoginMutation.AxiosResponse, LoginMutation.ErrorResponse, LoginMutation.Payload>(
    (data) => authApiService.login(data),
    {
      onSuccess: async () => {
        toast.success("Logged in")
        await router.invalidate()
      },
      onError: (error: LoginMutation.ErrorResponse) => {
        const rawMessage = error.response?.data.message
        const message = Array.isArray(rawMessage) ? rawMessage.join(", ") : rawMessage
        if (message) {
          toast.error(message)
        } else if (error.response?.data.error) {
          toast.error(error.response.data.error)
        }
      },
    },
  )
}
