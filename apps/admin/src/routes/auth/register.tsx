import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import type { APIError } from "@workspace/api-client"
import { type FieldError, FormWrapper, handleFieldError } from "@workspace/form"
import { FormHeader, RegisterForm } from "#/features/auth/components"
import { useRegisterForm } from "#/features/auth/hooks/form-handler"
import { useRegisterMutation } from "#/features/auth/hooks/mutation"
import type { RegisterSchema } from "#/features/auth/schemas"

export const Route = createFileRoute("/auth/register")({
  component: RegisterPage,
})

function RegisterPage() {
  const { form } = useRegisterForm()
  const registerMutation = useRegisterMutation()
  const navigate = useNavigate()

  const handleSubmit = form.handleSubmit((data: RegisterSchema) => {
    registerMutation.mutate(data, {
      onSuccess: () => {
        void navigate({ to: "/auth/verify-email", search: { email: data.email } })
      },
      onError: (err: APIError<FieldError<RegisterSchema>>) => {
        const fieldErrors = err.response?.data.errors
        if (fieldErrors) {
          handleFieldError(form, fieldErrors)
          return
        }
        const rawMessage = err.response?.data.message
        const message = Array.isArray(rawMessage) ? rawMessage.join(", ") : (rawMessage ?? err.response?.data.error ?? err.message)
        if (message) {
          form.setError("email", { type: "server", message: message as string })
        }
      },
    })
  })

  return (
    <div className="grid gap-6">
      <FormHeader heading="Create account" description="Full name will be collected after email verification (onboarding)." />

      <FormWrapper form={form} formProps={{ onSubmit: handleSubmit }} className="grid gap-4">
        <RegisterForm isPending={registerMutation.isPending} />
      </FormWrapper>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/auth/login" className="text-primary underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
