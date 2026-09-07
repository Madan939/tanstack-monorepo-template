import type { UseFormReturn } from "@workspace/form"
import { useForm } from "@workspace/form"
import type { OnboardingSchema } from "../../schemas"
import { onboardingSchema } from "../../schemas"

export function useOnboardingForm(): { form: UseFormReturn<OnboardingSchema> } {
  const form = useForm<OnboardingSchema>({
    schema: onboardingSchema,
    defaultValues: {
      fullName: "",
    },
  })

  return { form }
}
