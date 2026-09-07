import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import type { APIError } from "@workspace/api-client"
import { type FieldError, FormWrapper, handleFieldError } from "@workspace/form"
import { useState } from "react"
import { FormHeader, LoginForm } from "#/features/auth/components"
import { useLoginForm } from "#/features/auth/hooks/form-handler"
import { useLoginMutation } from "#/features/auth/hooks/mutation"
import type { LoginSchema } from "#/features/auth/schemas"
import { authApiService } from "#/features/auth/services"

type LoginSearch = {
  redirect?: string
}

export const Route = createFileRoute("/auth/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => {
    const redirect = typeof search.redirect === "string" && search.redirect !== "/" ? search.redirect : undefined
    return redirect ? { redirect } : {}
  },
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const search = Route.useSearch()
  const [error, setError] = useState<string | null>(null)

  const { form } = useLoginForm()
  const loginMutation = useLoginMutation()

  const handleSubmit = form.handleSubmit(
    (data: LoginSchema) => {
      setError(null)
      loginMutation.mutate(data, {
        onSuccess: async () => {
          // SSO: server has set httpOnly cookies server-side (refresh_token, csrf, admin_access_token).
          // Use typed service layer (no raw fetch) to decide next step.
          try {
            const res = await authApiService.me()
            const user = res.data as { emailVerified?: boolean; fullName?: string | null }
            if (!user.emailVerified) {
              void navigate({ to: "/auth/verify-email", search: { email: data.email }, replace: true })
              return
            }
            if (!user.fullName) {
              void navigate({ to: "/auth/onboarding", replace: true })
              return
            }
          } catch {
            // fallback to guards – e.g. network error, still redirect to intended target
          }
          // Authenticated & fully onboarded → dashboard (protected)
          void navigate({ to: search.redirect || "/", replace: true })
        },
        onError: (err: APIError<FieldError<LoginSchema>>) => {
          const status = (err as unknown as { response?: { status?: number } })?.response?.status ?? (err as unknown as { status?: number })?.status
          const rawMessage = err.response?.data.message as string | string[] | undefined
          const message = Array.isArray(rawMessage) ? rawMessage.join(", ") : (rawMessage ?? err.response?.data.error ?? err.message)
          // Email not verified → guide to verify page with email prefilled
          if (status === 403 && message && /not verified/i.test(message as string)) {
            setError("Email not verified. Redirecting to verification...")
            setTimeout(() => navigate({ to: "/auth/verify-email", search: { email: form.getValues("email") } }), 800)
            return
          }
          const fieldErrors = err.response?.data.errors
          if (fieldErrors) {
            handleFieldError(form, fieldErrors)
            setError("Please fix the highlighted fields")
            return
          }
          setError((message as string) ?? "Login failed")
        },
      })
    },
    () => setError("Please fix the highlighted fields"),
  )

  return (
    <div className="grid gap-6">
      <FormHeader heading="Sign in" description="Enter your credentials to access the admin panel." />

      <FormWrapper form={form} formProps={{ onSubmit: handleSubmit }} className="grid gap-4">
        <LoginForm isPending={loginMutation.isPending} error={error} />
      </FormWrapper>

      <div className="flex flex-col gap-2 text-center text-sm">
        <Link to="/auth/forgot-password" className="text-primary underline-offset-4 hover:underline">
          Forgot password?
        </Link>
        <span className="text-muted-foreground">
          No account?{" "}
          <Link to="/auth/register" className="text-primary underline-offset-4 hover:underline">
            Create one
          </Link>
        </span>
        <Link to="/auth/verify-email" className="text-muted-foreground underline-offset-4 hover:underline">
          Verify email
        </Link>
      </div>
    </div>
  )
}
