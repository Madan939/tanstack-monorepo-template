import { emailSchema } from "@workspace/schema"
import { z } from "zod"

export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>
