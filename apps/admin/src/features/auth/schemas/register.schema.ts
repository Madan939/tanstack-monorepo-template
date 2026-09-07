import { emailSchema, strongPasswordSchema } from "@workspace/schema"
import { z } from "zod"

export const registerSchema = z.object({
  email: emailSchema,
  password: strongPasswordSchema,
})

export type RegisterSchema = z.infer<typeof registerSchema>
