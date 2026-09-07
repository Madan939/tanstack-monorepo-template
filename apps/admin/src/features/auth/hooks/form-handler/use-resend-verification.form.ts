import type { UseFormReturn } from "@workspace/form"
import { useForm } from "@workspace/form"
import type { ResendVerificationSchema } from "../../schemas"
import { resendVerificationSchema } from "../../schemas"

export function useResendVerificationForm(initialEmail?: string): { form: UseFormReturn<ResendVerificationSchema> } {
  const form = useForm<ResendVerificationSchema>({
    schema: resendVerificationSchema,
    defaultValues: {
      email: initialEmail ?? "",
    },
  })

  return { form }
}
