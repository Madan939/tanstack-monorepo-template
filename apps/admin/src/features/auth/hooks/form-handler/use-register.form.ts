import type { UseFormReturn } from "@workspace/form"
import { useForm } from "@workspace/form"
import type { RegisterSchema } from "../../schemas"
import { registerSchema } from "../../schemas"

export function useRegisterForm(): { form: UseFormReturn<RegisterSchema> } {
  const form = useForm<RegisterSchema>({
    schema: registerSchema,
    defaultValues: {
      email: "",
      password: "",
    },
  })

  return { form }
}
