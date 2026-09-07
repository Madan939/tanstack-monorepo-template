import type { UseFormReturn } from "@workspace/form"
import { useForm } from "@workspace/form"
import type { VerifyEmailSchema } from "../../schemas"
import { verifyEmailSchema } from "../../schemas"

export function useVerifyEmailForm(initialEmail?: string, initialCode?: string): { form: UseFormReturn<VerifyEmailSchema> } {
  const form = useForm<VerifyEmailSchema>({
    schema: verifyEmailSchema,
    defaultValues: {
      email: initialEmail ?? "",
      code: initialCode ?? "",
    },
  })

  return { form }
}
