import { FormInput, FormPassword } from "@workspace/form"
import { Button } from "@workspace/ui"

type RegisterFormProps = {
  isPending?: boolean
  error?: string | null
}

export function RegisterForm({ isPending, error }: RegisterFormProps) {
  return (
    <div className="grid gap-4">
      <FormInput name="email" label="Email" required placeholder="you@example.com" autoComplete="email" />
      <FormPassword
        name="password"
        label="Password"
        required
        placeholder="Enter your password"
        autoComplete="new-password"
        hint="12+ chars, upper/lower, number & symbol"
      />
      {error ? (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={isPending}>
        Create account
      </Button>
    </div>
  )
}
