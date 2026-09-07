import { FormInput } from "@workspace/form"
import { Button } from "@workspace/ui"

type ForgotPasswordFormProps = {
  isPending?: boolean
}

export function ForgotPasswordForm({ isPending }: ForgotPasswordFormProps) {
  return (
    <div className="grid gap-4">
      <FormInput name="email" label="Email" required placeholder="you@example.com" autoComplete="email" />
      <Button type="submit" className="w-full" disabled={isPending}>
        Send reset link
      </Button>
    </div>
  )
}
