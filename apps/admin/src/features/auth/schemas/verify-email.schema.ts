import { z } from "zod"

export const verifyEmailSchema = z.object({
  email: z.string().trim().toLowerCase().email("Must be a valid email"),
  code: z.string().regex(/^\d{6}$/, "Code must be 6 digits"),
})

export type VerifyEmailSchema = z.infer<typeof verifyEmailSchema>

export const resendVerificationSchema = z.object({
  email: z.string().trim().toLowerCase().email("Must be a valid email"),
})

export type ResendVerificationSchema = z.infer<typeof resendVerificationSchema>
