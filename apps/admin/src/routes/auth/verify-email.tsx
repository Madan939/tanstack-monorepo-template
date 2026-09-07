import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
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
  const [verifyError, setVerifyError] = useState<string | null>(null)
  const [verifyDone, setVerifyDone] = useState(false)
  const [resendDone, setResendDone] = useState(false)
  const [resendError, setResendError] = useState<string | null>(null)
  const [expiresIn, setExpiresIn] = useState<number | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)

  const { form: verifyForm } = useVerifyEmailForm(emailFromSearch, "")
  const { form: resendForm } = useResendVerificationForm(emailFromSearch)
  const verifyMutation = useVerifyEmailMutation()
  const resendMutation = useResendVerificationMutation()

  // Sync email from search param into forms without extra API call
  useEffect(() => {
    if (emailFromSearch) {
      verifyForm.setValue("email", emailFromSearch)
      resendForm.setValue("email", emailFromSearch)
    }
  }, [emailFromSearch, verifyForm, resendForm])

  // 10-minute expiry countdown, resets on resend
  useEffect(() => {
    // Start 10 min timer on mount / after resend
    if (verifyDone) {
      setExpiresIn(null)
      return
    }
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
  }, [verifyDone, resendDone])

  // Resend cooldown 60s to prevent spamming
  useEffect(() => {
    if (resendCooldown <= 0) return
    const id = setInterval(() => setResendCooldown((c) => Math.max(0, c - 1)), 1000)
    return () => clearInterval(id)
  }, [resendCooldown])

  const handleVerify = verifyForm.handleSubmit(
    (data: VerifyEmailSchema) => {
      setVerifyError(null)
      verifyMutation.mutate(data, {
        onSuccess: () => {
          setVerifyDone(true)
          // No extra fetch - authGuard will handle session on next navigation
          setTimeout(() => navigate({ to: "/auth/login" }), 1200)
        },
        onError: (err: APIError<FieldError<VerifyEmailSchema>>) => {
          const fieldErrors = err.response?.data.errors
          if (fieldErrors) handleFieldError(verifyForm, fieldErrors)
          const rawMessage = err.response?.data.message
          const message = Array.isArray(rawMessage) ? rawMessage.join(", ") : (rawMessage ?? err.response?.data.error ?? err.message)
          setVerifyError(message ?? "Verification failed")
        },
      })
    },
    () => setVerifyError("Please fix the highlighted fields"),
  )

  const handleResend = resendForm.handleSubmit(
    (data: ResendVerificationSchema) => {
      if (resendCooldown > 0) return
      setResendError(null)
      setResendDone(false)
      resendMutation.mutate(data, {
        onSuccess: () => {
          setResendDone(true)
          setResendCooldown(60)
          setExpiresIn(10 * 60)
        },
        onError: (err: APIError<FieldError<ResendVerificationSchema>>) => {
          const fieldErrors = err.response?.data.errors
          if (fieldErrors) handleFieldError(resendForm, fieldErrors)
          const rawMessage = err.response?.data.message
          const message = Array.isArray(rawMessage) ? rawMessage.join(", ") : (rawMessage ?? err.response?.data.error ?? err.message)
          setResendError(message ?? "Request failed")
        },
      })
    },
    () => setResendError("Please fix the highlighted fields"),
  )

  return (
    <div className="grid gap-8">
      <div className="grid gap-6">
        <FormHeader heading="Verify email" description="Enter the 6-digit code sent to your email. Code expires in 10 minutes." />

        {verifyDone ? (
          <div className="bg-muted p-3 text-sm">
            Email verified. Redirecting to <Link to="/auth/login" className="text-primary underline">sign in</Link>...
          </div>
        ) : null}
        {expiresIn === 0 && !verifyDone ? (
          <p role="alert" className="bg-destructive/10 text-destructive p-3 text-sm">Code expired. Please request a new one below.</p>
        ) : null}

        <FormWrapper form={verifyForm} formProps={{ onSubmit: handleVerify }} className="grid gap-4">
          <VerifyEmailForm isPending={verifyMutation.isPending} error={verifyError} emailReadOnly={!!emailFromSearch} expiresIn={expiresIn} />
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

        {resendDone ? (
          <p role="status" className="bg-muted p-3 text-sm">
            If this email is not already registered, a verification code has been sent (expires in 10 minutes).
          </p>
        ) : null}

        <FormWrapper form={resendForm} formProps={{ onSubmit: handleResend }} className="grid gap-4">
          <ResendVerificationForm isPending={resendMutation.isPending} error={resendError} disabled={resendCooldown > 0} cooldown={resendCooldown} />
        </FormWrapper>
      </div>
    </div>
  )
}
