import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import type { APIError } from "@workspace/api-client"
import { type FieldError, FormWrapper, handleFieldError } from "@workspace/form"
import { Typography } from "@workspace/ui/components/shared/typography"
import { useState } from "react"
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
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const { form } = useResetPasswordForm(token)
  const resetMutation = useResetPasswordMutation()

  if (done) {
    return (
      <div className="grid gap-4 text-center">
        <Typography.h3>Password reset</Typography.h3>
        <Typography variant="muted">Your password has been reset. Redirecting to sign in...</Typography>
        <Link to="/auth/login" className="text-primary text-sm underline-offset-4 hover:underline">
          Sign in
        </Link>
      </div>
    )
  }

  const handleSubmit = form.handleSubmit(
    (data: ResetPasswordSchema) => {
      setError(null)
      resetMutation.mutate(data, {
        onSuccess: () => {
          setDone(true)
          setTimeout(() => navigate({ to: "/auth/login" }), 1000)
        },
        onError: (err: APIError<FieldError<ResetPasswordSchema>>) => {
          const fieldErrors = err.response?.data.errors
          if (fieldErrors) {
            handleFieldError(form, fieldErrors)
            setError("Please fix the highlighted fields")
            return
          }
          const rawMessage = err.response?.data.message
          const message = Array.isArray(rawMessage) ? rawMessage.join(", ") : (rawMessage ?? err.response?.data.error ?? err.message)
          setError(message ?? "Reset failed")
        },
      })
    },
    () => setError("Please fix the highlighted fields"),
  )

  return (
    <div className="grid gap-6">
      <FormHeader heading="Reset password" description="Paste the token from your email and choose a new password." />

      <FormWrapper form={form} formProps={{ onSubmit: handleSubmit }} className="grid gap-4">
        <ResetPasswordForm isPending={resetMutation.isPending} error={error} />
      </FormWrapper>

      <Link to="/auth/login" className="text-center text-sm text-muted-foreground underline-offset-4 hover:underline">
        Back to sign in
      </Link>
    </div>
  )
}
