import { FormInput, FormPassword } from "@workspace/form"
import { Button } from "@workspace/ui"
import { useState } from "react"
import { CaptchaField } from "../captcha-field"

type RegisterFormProps = {
  isPending?: boolean
  error?: string | null
}

export function RegisterForm({ isPending, error }: RegisterFormProps) {
  const [captchaVerified, setCaptchaVerified] = useState<boolean>(true)

  return (
    <div className="grid gap-4">
      <FormInput name="email" label="Email" required placeholder="you@example.com" autoComplete="email" />
      <FormPassword
        name="password"
        label="Password"
        required
        placeholder="Enter your password"
        autoComplete="new-password"
        description="12+ chars, upper/lower, number & symbol"
      />
      <CaptchaField onVerifiedChange={setCaptchaVerified} />
      {error ? (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={isPending || !captchaVerified}>
        {isPending ? "Creating account..." : "Create account"}
      </Button>
    </div>
  )
}
