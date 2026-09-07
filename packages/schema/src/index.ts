/**
 * @workspace/schema — Reusable, type-safe Zod primitives for any system
 *
 * Single source of truth for common validation (email, password, phone, etc.).
 * Compose your own domain schemas from these primitives:
 *
 * ```ts
 * import { emailSchema, strongPasswordSchema } from "@workspace/schema"
 * import { z } from "zod"
 *
 * export const registerSchema = z.object({
 *   email: emailSchema,
 *   password: strongPasswordSchema,
 * })
 * ```
 *
 * Also available as subpath: `@workspace/schema/common`
 */

export * from "./schemas/common"
