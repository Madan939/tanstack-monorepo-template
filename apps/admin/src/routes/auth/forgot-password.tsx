import { createFileRoute, Link } from "@tanstack/react-router"
import type { APIError } from "@workspace/api-client"
import { FormWrapper } from "@workspace/form"
import { ForgotPasswordForm, FormHeader } from "#/features/auth/components"
import { useForgotPasswordForm } from "#/features/auth/hooks/form-handler"
import { useForgotPasswordMutation } from "#/features/auth/hooks/mutation"
import type { ForgotPasswordSchema } from "#/features/auth/schemas"

export const Route = createFileRoute("/auth/forgot-password")({
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
  const { form } = useForgotPasswordForm()
  const forgotMutation = useForgotPasswordMutation()

  const handleSubmit = form.handleSubmit((data: ForgotPasswordSchema) => {
    forgotMutation.mutate(data, {
      onError: (e: APIError) => {
        const rawMessage = e.response?.data.message
        const message = Array.isArray(rawMessage) ? rawMessage.join(", ") : (rawMessage ?? e.response?.data.error ?? e.message)
        if (message) {
          form.setError("email", { type: "server", message: message as string })
        }
      },
    })
  })

  return (
    <div className="grid gap-6">
      <FormHeader heading="Forgot password" description="We will send a reset link if the email exists (no enumeration)." />

      <FormWrapper form={form} formProps={{ onSubmit: handleSubmit }} className="grid gap-4">
        <ForgotPasswordForm isPending={forgotMutation.isPending} />
      </FormWrapper>

      <div className="flex justify-between text-sm">
        <Link to="/auth/login" className="text-muted-foreground underline-offset-4 hover:underline">
          Back to sign in
        </Link>
        <Link to="/auth/reset-password" className="text-primary underline-offset-4 hover:underline">
          Have a token? Reset
        </Link>
      </div>
    </div>
  )
}
