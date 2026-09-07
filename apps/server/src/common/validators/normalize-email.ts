import { applyDecorators } from "@nestjs/common"
import { Transform } from "class-transformer"
import { IsEmail } from "class-validator"

/**
 * Trims and lowercases the value. Emails are always stored/compared in
 * normalized form to prevent duplicate accounts via case differences.
 */
export function NormalizeEmail() {
  return applyDecorators(
    Transform(({ value }) => (typeof value === "string" ? value.trim().toLowerCase() : value)),
    IsEmail({}, { message: "must be a valid email address" }),
  )
}
