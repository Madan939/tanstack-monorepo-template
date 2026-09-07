import { FormInput, FormPassword } from "@workspace/form"
import { Button } from "@workspace/ui"
import { useState } from "react"
import { CaptchaField } from "../captcha"

type LoginFormProps = {
  isPending?: boolean
}

export function LoginForm({ isPending }: LoginFormProps) {
  const [captchaVerified, setCaptchaVerified] = useState<boolean>(true)

  return (
    <div className="grid gap-4">
      <FormInput name="email" label="Email" required placeholder="you@example.com" autoComplete="email" />
      <FormPassword name="password" label="Password" required placeholder="Enter your password" autoComplete="current-password" />
      <CaptchaField onVerifiedChange={setCaptchaVerified} />
      <Button type="submit" className="w-full"  disabled={isPending || !captchaVerified}>
        {isPending ? "Signing in..." : "Sign in"}
      </Button>
    </div>
  )
}
