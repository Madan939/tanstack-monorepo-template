import { fullNameSchema } from "@workspace/schema"
import { z } from "zod"

export const onboardingSchema = z.object({
  fullName: fullNameSchema,
})

export type OnboardingSchema = z.infer<typeof onboardingSchema>
