import { useMutation } from "@workspace/query"
import { toast } from "@workspace/ui"
import { CONFIG } from "#/config"
import { authApiService } from "../../services"
import type { OnboardingMutation } from "../../types"

export function useOnboardingMutation() {
  return useMutation<OnboardingMutation.AxiosResponse, OnboardingMutation.ErrorResponse, OnboardingMutation.Payload>(
    (payload) => authApiService.onboarding(payload),
    {
      invalidateKeys: [CONFIG.QUERY_KEY.AUTH.ME],
      onSuccess: () => {
        toast.success("Onboarding complete")
      },
      onError: (error: OnboardingMutation.ErrorResponse) => {
        const rawMessage = error.response?.data.message
        const message = Array.isArray(rawMessage) ? rawMessage.join(", ") : rawMessage
        toast.error(message ?? error.response?.data.error ?? "Onboarding failed")
      },
    },
  )
}
