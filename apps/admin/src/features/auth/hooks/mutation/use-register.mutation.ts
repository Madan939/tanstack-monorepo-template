import { useMutation } from "@workspace/query"
import { authApiService } from "../../services"
import type { RegisterMutation } from "../../types"

export function useRegisterMutation() {
  return useMutation<RegisterMutation.AxiosResponse, RegisterMutation.ErrorResponse, RegisterMutation.Payload>(
    (data) => authApiService.register(data),
  )
}
