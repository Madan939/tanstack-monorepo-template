import type { UseFormReturn } from "@workspace/form"
import { useForm } from "@workspace/form"
import type { LoginSchema } from "../../schemas"
import { loginSchema } from "../../schemas"

export function useLoginForm(): { form: UseFormReturn<LoginSchema> } {
  const form = useForm<LoginSchema>({
    schema: loginSchema,
    defaultValues: {
      email: "",
      password: "",
    },
  })

  return { form }
}
