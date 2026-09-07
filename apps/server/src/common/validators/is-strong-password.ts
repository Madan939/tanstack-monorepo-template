import { applyDecorators } from "@nestjs/common"
import { IsString, Matches, MaxLength, MinLength } from "class-validator"

/**
 * Password policy aligned with NIST SP 800-63B / OWASP guidance:
 * length-first (>= 12 chars), all printable characters allowed, and basic
 * complexity requirements to resist dictionary attacks.
 */
export function IsStrongPassword() {
  return applyDecorators(
    IsString(),
    MinLength(12, { message: "password must be at least 12 characters long" }),
    MaxLength(128, { message: "password must be at most 128 characters long" }),
    Matches(/[a-z]/, { message: "password must contain a lowercase letter" }),
    Matches(/[A-Z]/, { message: "password must contain an uppercase letter" }),
    Matches(/[0-9]/, { message: "password must contain a number" }),
    Matches(/[^A-Za-z0-9]/, { message: "password must contain a special character" }),
  )
}
