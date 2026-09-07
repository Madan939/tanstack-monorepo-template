import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router"
import type { APIError } from "@workspace/api-client"
import { type FieldError, FormWrapper, handleFieldError } from "@workspace/form"
import { Typography } from "@workspace/ui/components/shared/typography"
import { useState } from "react"
import { FormHeader, OnboardingForm } from "#/features/auth/components"
import { useOnboardingForm } from "#/features/auth/hooks/form-handler"
import { useOnboardingMutation } from "#/features/auth/hooks/mutation"
import type { OnboardingSchema } from "#/features/auth/schemas"

export const Route = createFileRoute("/auth/onboarding")({
  component: OnboardingPage,
})

function OnboardingPage() {
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const { form } = useOnboardingForm()
  const onboardingMutation = useOnboardingMutation()
  const navigate = useNavigate()
  const router = useRouter()
  if (done) {
    return (
      <div className="grid gap-4 text-center">
        <Typography.h3>Onboarding complete</Typography.h3>
        <Typography variant="muted">Redirecting to dashboard...</Typography>
        <Link to="/" className="text-primary text-sm underline-offset-4 hover:underline">
          Go to dashboard
        </Link>
      </div>
    )
  }

  const handleSubmit = form.handleSubmit(
    (data: OnboardingSchema) => {
      setError(null)
      onboardingMutation.mutate(data, {
        onSuccess: async () => {
          setDone(true)
          await router.invalidate()
          setTimeout(() => navigate({ to: "/" }), 600)
        },
        onError: (err: APIError<FieldError<OnboardingSchema>>) => {
          const fieldErrors = err.response?.data.errors
          if (fieldErrors) handleFieldError(form, fieldErrors)
          const rawMessage = err.response?.data.message
          const msg = Array.isArray(rawMessage) ? rawMessage.join(", ") : (rawMessage ?? err.response?.data.error ?? err.message)
          setError(msg ?? "Onboarding failed")
        },
      })
    },
    () => setError("Please fix the highlighted fields"),
  )

  return (
    <div className="grid gap-6">
      <FormHeader heading="Complete onboarding" description="This step is required after email verification. Provide your full name to finish setup." />

      <FormWrapper form={form} formProps={{ onSubmit: handleSubmit }} className="grid gap-4">
        <OnboardingForm isPending={onboardingMutation.isPending} error={error} />
      </FormWrapper>

      <div className="flex justify-between text-sm">
        <Link to="/auth/login" className="text-muted-foreground underline-offset-4 hover:underline">
          Back to sign in
        </Link>
        <a
          href={`${import.meta.env.VITE_API_URL ?? "http://localhost:5000"}/user/me`}
          target="_blank"
          rel="noreferrer"
          className="text-primary underline-offset-4 hover:underline"
        >
          Check /user/me (API)
        </a>
      </div>

      <Typography variant="caption" color="muted" className="text-center">
        Tip: after onboarding, <code>GET /user/me</code> will show <code>fullName</code> populated.
      </Typography>
    </div>
  )
}
