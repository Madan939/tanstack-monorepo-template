import { createFileRoute, Link } from "@tanstack/react-router"
import type { APIError } from "@workspace/api-client"
import { FormWrapper } from "@workspace/form"
import { useState } from "react"
import { ForgotPasswordForm, FormHeader } from "#/features/auth/components"
import { useForgotPasswordForm } from "#/features/auth/hooks/form-handler"
import { useForgotPasswordMutation } from "#/features/auth/hooks/mutation"
import type { ForgotPasswordSchema } from "#/features/auth/schemas"

export const Route = createFileRoute("/auth/forgot-password")({
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { form } = useForgotPasswordForm()
  const forgotMutation = useForgotPasswordMutation()

  const handleSubmit = form.handleSubmit((data: ForgotPasswordSchema) => {
    setError(null)
    forgotMutation.mutate(data, {
      onSuccess: () => setDone(true),
      onError: (e: APIError) => {
        const rawMessage = e.response?.data.message
        const message = Array.isArray(rawMessage) ? rawMessage.join(", ") : (rawMessage ?? e.response?.data.error ?? e.message)
        setError(message ?? "Request failed")
      },
    })
  })

  return (
    <div className="grid gap-6">
      <FormHeader heading="Forgot password" description="We will send a reset link if the email exists (no enumeration)." />

      {done ? (
        <p role="status" className="bg-muted p-3 text-sm">
          If an account with this email exists and is active, a password reset link has been sent.
        </p>
      ) : null}

      <FormWrapper form={form} formProps={{ onSubmit: handleSubmit }} className="grid gap-4">
        <ForgotPasswordForm isPending={forgotMutation.isPending} error={error} />
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
