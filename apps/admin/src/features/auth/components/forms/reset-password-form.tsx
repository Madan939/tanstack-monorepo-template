import { FormInput, FormPassword } from "@workspace/form"
import { Button } from "@workspace/ui"

type ResetPasswordFormProps = {
  isPending?: boolean
}

export function ResetPasswordForm({ isPending }: ResetPasswordFormProps) {
  return (
    <div className="grid gap-4">
      <FormInput name="token" label="Reset token" required placeholder="Paste token from email" />
      <FormPassword
        name="newPassword"
        label="New password"
        required
        placeholder="Enter new password"
        autoComplete="new-password"
        description="12+ chars, upper/lower, number & symbol"
      />
      <Button type="submit" className="w-full" disabled={isPending}>
        Reset password
      </Button>
    </div>
  )
}
