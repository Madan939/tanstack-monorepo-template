import { FormInput } from "@workspace/form"
import { Button } from "@workspace/ui"

type ForgotPasswordFormProps = {
  isPending?: boolean
  error?: string | null
}

export function ForgotPasswordForm({ isPending, error }: ForgotPasswordFormProps) {
  return (
    <div className="grid gap-4">
      <FormInput name="email" label="Email" required placeholder="you@example.com" autoComplete="email" />
      {error ? (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={isPending}>
        Send reset link
      </Button>
    </div>
  )
}
