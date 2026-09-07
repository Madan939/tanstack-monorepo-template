import { createFileRoute, Link } from "@tanstack/react-router"
import type { APIError } from "@workspace/api-client"
import { type FieldError, FormWrapper, handleFieldError } from "@workspace/form"
import { FormHeader, ResetPasswordForm } from "#/features/auth/components"
import { useResetPasswordForm } from "#/features/auth/hooks/form-handler"
import { useResetPasswordMutation } from "#/features/auth/hooks/mutation"
import type { ResetPasswordSchema } from "#/features/auth/schemas"

export const Route = createFileRoute("/auth/reset-password")({
  component: ResetPasswordPage,
  validateSearch: (search: Record<string, unknown>) => {
    const token = search.token as string | undefined
    return token ? { token } : {}
  },
})

function ResetPasswordPage() {
  const { token } = Route.useSearch()
  const { form } = useResetPasswordForm(token)
  const resetMutation = useResetPasswordMutation()

  const handleSubmit = form.handleSubmit((data: ResetPasswordSchema) => {
    resetMutation.mutate(data, {
      onError: (err: APIError<FieldError<ResetPasswordSchema>>) => {
        const fieldErrors = err.response?.data.errors
        if (fieldErrors) {
          handleFieldError(form, fieldErrors)
          return
        }
        const rawMessage = err.response?.data.message
        const message = Array.isArray(rawMessage) ? rawMessage.join(", ") : (rawMessage ?? err.response?.data.error ?? err.message)
        if (message) {
          form.setError("token", { type: "server", message: message as string })
        }
      },
    })
  })

  return (
    <div className="grid gap-6">
      <FormHeader heading="Reset password" description="Paste the token from your email and choose a new password." />

      <FormWrapper form={form} formProps={{ onSubmit: handleSubmit }} className="grid gap-4">
        <ResetPasswordForm isPending={resetMutation.isPending} />
      </FormWrapper>

      <Link to="/auth/login" className="text-center text-sm text-muted-foreground underline-offset-4 hover:underline">
        Back to sign in
      </Link>
    </div>
  )
}
