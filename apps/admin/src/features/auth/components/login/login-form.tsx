import { FormInput, FormPassword } from "@workspace/form"
import { Button } from "@workspace/ui"

type LoginFormProps = {
  isPending?: boolean
  error?: string | null
}

export function LoginForm({ isPending, error }: LoginFormProps) {
  return (
    <div className="grid gap-4">
      <FormInput name="email" label="Email" required placeholder="you@example.com" autoComplete="email" />
      <FormPassword name="password" label="Password" required placeholder="Enter your password" autoComplete="current-password" />
      {error ? (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Signing in..." : "Sign in"}
      </Button>
    </div>
  )
}
