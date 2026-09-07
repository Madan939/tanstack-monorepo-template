import { emailSchema } from "@workspace/schema"
import { z } from "zod"

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required").max(128),
})

export type LoginSchema = z.infer<typeof loginSchema>
