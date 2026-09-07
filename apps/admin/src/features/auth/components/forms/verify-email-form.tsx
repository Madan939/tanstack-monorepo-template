import { FormInput } from "@workspace/form"
import { Button } from "@workspace/ui"

type VerifyFormProps = {
  isPending?: boolean
  emailReadOnly?: boolean
  expiresIn?: number | null
}

export function VerifyEmailForm({ isPending, emailReadOnly, expiresIn }: VerifyFormProps) {
  return (
    <div className="grid gap-4">
      <FormInput name="email" label="Email" required placeholder="you@example.com" autoComplete="email" disabled={emailReadOnly} />
      <FormInput name="code" label="6-digit code" required placeholder="123456" inputMode="numeric" pattern="\d{6}" maxLength={6} autoComplete="one-time-code" />
      {expiresIn !== null && expiresIn !== undefined ? (
        <p className="text-xs text-muted-foreground">
          Code expires in <span className="font-medium">{Math.floor(expiresIn / 60)}:{String(expiresIn % 60).padStart(2, "0")}</span>
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">Code expires in 10 minutes. Check your inbox (and spam folder).</p>
      )}
      <Button type="submit" className="w-full" disabled={isPending}>
        Verify email
      </Button>
    </div>
  )
}

type ResendFormProps = {
  isPending?: boolean
  disabled?: boolean
  cooldown?: number | null
}

export function ResendVerificationForm({ isPending, disabled, cooldown }: ResendFormProps) {
  return (
    <div className="grid gap-4">
      <FormInput name="email" label="Email" required placeholder="you@example.com" autoComplete="email" />
      <Button type="submit" variant="outline" className="w-full" disabled={isPending || disabled}>
        {cooldown && cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
      </Button>
    </div>
  )
}
