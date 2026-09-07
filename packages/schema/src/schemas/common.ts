import { z } from "zod"

/**
 * Common primitives — single source of truth for all system validation.
 * Every schema is WAI-ARIA / WCAG friendly: clear messages, i18n-ready.
 */

// ---------------------------------------------------------------------------
// Email — RFC 5321/5322, lowercased + trimmed before validation (prevents
// duplicate accounts via case/whitespace). Max 254 per spec.
// ---------------------------------------------------------------------------
export const emailSchema = z
  .string({ message: "Email is required" })
  .trim()
  .toLowerCase()
  .min(1, "Email is required")
  .max(254, "Email must be at most 254 characters")
  .email("Must be a valid email address")

export const optionalEmailSchema = emailSchema.optional().or(z.literal(""))

// ---------------------------------------------------------------------------
// Password — NIST SP 800-63B / OWASP: length-first (≥12), all printable chars
// allowed, plus complexity to resist dictionary attacks. Matches
// backend IsStrongPassword (12-128, lower, upper, digit, special).
// ---------------------------------------------------------------------------
const strongPasswordRegex = {
  lower: /[a-z]/,
  upper: /[A-Z]/,
  digit: /[0-9]/,
  special: /[^A-Za-z0-9]/,
}

export const strongPasswordSchema = z
  .string({ message: "Password is required" })
  .min(12, "Password must be at least 12 characters")
  .max(128, "Password must be at most 128 characters")
  .refine((v) => strongPasswordRegex.lower.test(v), "Must contain a lowercase letter")
  .refine((v) => strongPasswordRegex.upper.test(v), "Must contain an uppercase letter")
  .refine((v) => strongPasswordRegex.digit.test(v), "Must contain a number")
  .refine((v) => strongPasswordRegex.special.test(v), "Must contain a special character")

/** For login / currentPassword — only check presence, not strength. */
export const passwordSchema = z
  .string({ message: "Password is required" })
  .min(1, "Password is required")
  .max(128, "Password must be at most 128 characters")

// ---------------------------------------------------------------------------
// Token — Opaque, URL-safe one-time token (base64url, 32 bytes => 43 chars).
// Used for email verification & password reset. Backend expects 43-128.
// ---------------------------------------------------------------------------
export const tokenSchema = z
  .string({ message: "Token is required" })
  .min(43, "Invalid token")
  .max(128, "Invalid token")

// ---------------------------------------------------------------------------
// Full name — Unicode-aware, 1-128 after trim. Supports international names
// (Noto Sans coverage). Optional for registration, required for onboarding.
// ---------------------------------------------------------------------------
export const fullNameSchema = z
  .string()
  .trim()
  .min(1, "Full name is required")
  .max(128, "Full name must be at most 128 characters")

export const optionalFullNameSchema = z
  .string()
  .trim()
  .max(128, "Full name must be at most 128 characters")
  .optional()
  .or(z.literal(""))
  .transform((v) => (v === "" ? undefined : v))

// ---------------------------------------------------------------------------
// UUID v4
// ---------------------------------------------------------------------------
export const uuidSchema = z.string().uuid("Must be a valid UUID")

// ---------------------------------------------------------------------------
// Pagination — shared by list endpoints (e.g., GET /user is removed, but
// kept for future admin lists). Mirrors ListUsersQueryDto.
// ---------------------------------------------------------------------------
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

export type Pagination = z.infer<typeof paginationSchema>

// ---------------------------------------------------------------------------
// Username — 3-30, alphanumeric + _ - . ; internationalized via Unicode
// letter support could be added, but keep ASCII for system-wide uniqueness.
// ---------------------------------------------------------------------------
export const usernameSchema = z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must be at most 30 characters")
  .regex(/^[a-zA-Z0-9_.-]+$/, "Only letters, numbers, _, - and . allowed")

// ---------------------------------------------------------------------------
// Phone — E.164 (e.g., +14155552671), 7-15 digits after +
// ---------------------------------------------------------------------------
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+[1-9]\d{6,14}$/, "Must be a valid E.164 phone number (e.g., +14155552671)")

export const optionalPhoneSchema = phoneSchema.optional().or(z.literal(""))

// ---------------------------------------------------------------------------
// URL — https only for security, max 2048
// ---------------------------------------------------------------------------
export const urlSchema = z.string().trim().url("Must be a valid URL").max(2048)
export const httpsUrlSchema = urlSchema.refine(
  (v) => v.startsWith("https://"),
  "Must be an https URL",
)

// ---------------------------------------------------------------------------
// Generic text fields
// ---------------------------------------------------------------------------
export const shortTextSchema = (max = 128) =>
  z.string().trim().min(1, "This field is required").max(max, `Must be at most ${max} characters`)

export const longTextSchema = (max = 1000) =>
  z.string().trim().max(max, `Must be at most ${max} characters`)

export const optionalShortTextSchema = (max = 128) =>
  z.string().trim().max(max, `Must be at most ${max} characters`).optional().or(z.literal(""))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
export const trimString = z.string().transform((v) => v.trim())
export const lowerTrimString = z.string().transform((v) => v.trim().toLowerCase())
