import { strongPasswordSchema, tokenSchema } from "@workspace/schema"
import { z } from "zod"

export const resetPasswordSchema = z.object({
  token: tokenSchema,
  newPassword: strongPasswordSchema,
})

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>
