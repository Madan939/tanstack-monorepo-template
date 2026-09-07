import { createFileRoute, useNavigate } from "@tanstack/react-router"
import type { APIError } from "@workspace/api-client"
import { type FieldError, FormWrapper, handleFieldError } from "@workspace/form"
import { Typography } from "@workspace/ui/components/shared/typography"
import { useEffect, useState } from "react"
import { FormHeader, ResendVerificationForm, VerifyEmailForm } from "#/features/auth/components"
import { useResendVerificationForm, useVerifyEmailForm } from "#/features/auth/hooks/form-handler"
import { useResendVerificationMutation, useVerifyEmailMutation } from "#/features/auth/hooks/mutation"
import type { ResendVerificationSchema, VerifyEmailSchema } from "#/features/auth/schemas"

export const Route = createFileRoute("/auth/verify-email")({
  component: VerifyEmailPage,
  validateSearch: (search: Record<string, unknown>) => {
    const email = typeof search.email === "string" ? search.email : undefined
    return email ? { email } : {}
  },
})

function VerifyEmailPage() {
  const { email: emailFromSearch } = Route.useSearch() as { email?: string }
  const navigate = useNavigate()
  const [expiresIn, setExpiresIn] = useState<number | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)

  const { form: verifyForm } = useVerifyEmailForm(emailFromSearch, "")
  const { form: resendForm } = useResendVerificationForm(emailFromSearch)
  const verifyMutation = useVerifyEmailMutation()
  const resendMutation = useResendVerificationMutation()

  // Sync email from search param into forms
  useEffect(() => {
    if (emailFromSearch) {
      verifyForm.setValue("email", emailFromSearch)
      resendForm.setValue("email", emailFromSearch)
    }
  }, [emailFromSearch, verifyForm, resendForm])

  // 10-minute expiry countdown
  useEffect(() => {
    setExpiresIn(10 * 60)
    const id = setInterval(() => {
      setExpiresIn((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(id)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [])

  // Resend cooldown 60s
  useEffect(() => {
    if (resendCooldown <= 0) return
    const id = setInterval(() => setResendCooldown((c) => Math.max(0, c - 1)), 1000)
    return () => clearInterval(id)
  }, [resendCooldown])

  const handleVerify = verifyForm.handleSubmit((data: VerifyEmailSchema) => {
    verifyMutation.mutate(data, {
      onSuccess: () => {
        void navigate({ to: "/auth/login" })
      },
      onError: (err: APIError<FieldError<VerifyEmailSchema>>) => {
        const fieldErrors = err.response?.data.errors
        if (fieldErrors) handleFieldError(verifyForm, fieldErrors)
        const rawMessage = err.response?.data.message
        const message = Array.isArray(rawMessage) ? rawMessage.join(", ") : (rawMessage ?? err.response?.data.error ?? err.message)
        if (message) {
          verifyForm.setError("code", { type: "server", message: message as string })
        }
      },
    })
  })

  const handleResend = resendForm.handleSubmit((data: ResendVerificationSchema) => {
    if (resendCooldown > 0) return
    resendMutation.mutate(data, {
      onSuccess: () => {
        setResendCooldown(60)
        setExpiresIn(10 * 60)
      },
      onError: (err: APIError<FieldError<ResendVerificationSchema>>) => {
        const fieldErrors = err.response?.data.errors
        if (fieldErrors) handleFieldError(resendForm, fieldErrors)
        const rawMessage = err.response?.data.message
        const message = Array.isArray(rawMessage) ? rawMessage.join(", ") : (rawMessage ?? err.response?.data.error ?? err.message)
        if (message) {
          resendForm.setError("email", { type: "server", message: message as string })
        }
      },
    })
  })

  return (
    <div className="grid gap-8">
      <div className="grid gap-6">
        <FormHeader heading="Verify email" description="Enter the 6-digit code sent to your email. Code expires in 10 minutes." />

        {expiresIn === 0 ? (
          <p role="alert" className="bg-destructive/10 text-destructive p-3 text-sm">Code expired. Please request a new one below.</p>
        ) : null}

        <FormWrapper form={verifyForm} formProps={{ onSubmit: handleVerify }} className="grid gap-4">
          <VerifyEmailForm isPending={verifyMutation.isPending} emailReadOnly={!!emailFromSearch} expiresIn={expiresIn} />
        </FormWrapper>
        {emailFromSearch ? (
          <p className="text-xs text-muted-foreground">
            Code sent to <span className="font-medium">{emailFromSearch}</span>. Change email{" "}
            <button type="button" className="text-primary underline" onClick={() => navigate({ to: "/auth/verify-email", search: {} })}>
              here
            </button>
          </p>
        ) : null}
      </div>

      <div className="border-t pt-6 grid gap-4">
        <div className="grid gap-1">
          <Typography.h4>Resend code</Typography.h4>
          <Typography variant="muted">Didn&apos;t get the code? Check spam folder. We&apos;ll resend if the address exists (no enumeration).</Typography>
        </div>

        <FormWrapper form={resendForm} formProps={{ onSubmit: handleResend }} className="grid gap-4">
          <ResendVerificationForm isPending={resendMutation.isPending} disabled={resendCooldown > 0} cooldown={resendCooldown} />
        </FormWrapper>
      </div>
    </div>
  )
}
