import type { UseFormReturn } from "@workspace/form"
import { useForm } from "@workspace/form"
import type { ResetPasswordSchema } from "../../schemas"
import { resetPasswordSchema } from "../../schemas"

export function useResetPasswordForm(initialToken?: string): { form: UseFormReturn<ResetPasswordSchema> } {
  const form = useForm<ResetPasswordSchema>({
    schema: resetPasswordSchema,
    defaultValues: {
      token: initialToken ?? "",
      newPassword: "",
    },
  })

  return { form }
}
