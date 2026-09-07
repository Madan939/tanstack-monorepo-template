import { FormInput } from "@workspace/form"
import { Button } from "@workspace/ui"

type OnboardingFormProps = {
  isPending?: boolean
}

export function OnboardingForm({ isPending }: OnboardingFormProps) {
  return (
    <div className="grid gap-4">
      <FormInput name="fullName" label="Full name" required placeholder="Jane Doe" autoComplete="name" description="1–128 characters" />
      <Button type="submit" className="w-full" disabled={isPending}>
        Complete onboarding
      </Button>
    </div>
  )
}
