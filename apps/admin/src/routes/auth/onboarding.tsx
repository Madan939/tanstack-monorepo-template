import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router"
import type { APIError } from "@workspace/api-client"
import { type FieldError, FormWrapper, handleFieldError } from "@workspace/form"
import { Typography } from "@workspace/ui/components/shared/typography"
import { CONFIG } from "#/config"
import { FormHeader, OnboardingForm } from "#/features/auth/components"
import { useOnboardingForm } from "#/features/auth/hooks/form-handler"
import { useOnboardingMutation } from "#/features/auth/hooks/mutation"
import type { OnboardingSchema } from "#/features/auth/schemas"

export const Route = createFileRoute("/auth/onboarding")({
  component: OnboardingPage,
})

function OnboardingPage() {
  const { form } = useOnboardingForm()
  const onboardingMutation = useOnboardingMutation()
  const navigate = useNavigate()
  const router = useRouter()

  const handleSubmit = form.handleSubmit((data: OnboardingSchema) => {
    onboardingMutation.mutate(data, {
      onSuccess: async () => {
        await router.invalidate()
        void navigate({ to: "/" })
      },
      onError: (err: APIError<FieldError<OnboardingSchema>>) => {
        const fieldErrors = err.response?.data.errors
        if (fieldErrors) handleFieldError(form, fieldErrors)
        const rawMessage = err.response?.data.message
        const msg = Array.isArray(rawMessage) ? rawMessage.join(", ") : (rawMessage ?? err.response?.data.error ?? err.message)
        if (msg) {
          form.setError("fullName", { type: "server", message: msg as string })
        }
      },
    })
  })

  return (
    <div className="grid gap-6">
      <FormHeader heading="Complete onboarding" description="This step is required after email verification. Provide your full name to finish setup." />

      <FormWrapper form={form} formProps={{ onSubmit: handleSubmit }} className="grid gap-4">
        <OnboardingForm isPending={onboardingMutation.isPending} />
      </FormWrapper>

      <div className="flex justify-between text-sm">
        <Link to="/auth/login" className="text-muted-foreground underline-offset-4 hover:underline">
          Back to sign in
        </Link>
        <a
          href={`${CONFIG.API_URL}/user/me`}
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
