import { FormInput, FormPassword } from "@workspace/form"
import { Button } from "@workspace/ui"

type ResetPasswordFormProps = {
  isPending?: boolean
  error?: string | null
}

export function ResetPasswordForm({ isPending, error }: ResetPasswordFormProps) {
  return (
    <div className="grid gap-4">
      <FormInput name="token" label="Reset token" required placeholder="Paste token from email" />
      <FormPassword
        name="newPassword"
        label="New password"
        required
        placeholder="Enter new password"
        autoComplete="new-password"
        hint="12+ chars, upper/lower, number & symbol"
      />
      {error ? (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={isPending}>
        Reset password
      </Button>
    </div>
  )
}
