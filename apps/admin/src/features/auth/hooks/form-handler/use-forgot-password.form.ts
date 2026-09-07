import type { UseFormReturn } from "@workspace/form"
import { useForm } from "@workspace/form"
import type { ForgotPasswordSchema } from "../../schemas"
import { forgotPasswordSchema } from "../../schemas"

export function useForgotPasswordForm(): { form: UseFormReturn<ForgotPasswordSchema> } {
  const form = useForm<ForgotPasswordSchema>({
    schema: forgotPasswordSchema,
    defaultValues: {
      email: "",
    },
  })

  return { form }
}
