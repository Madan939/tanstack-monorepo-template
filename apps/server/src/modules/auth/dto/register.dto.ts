import { ApiProperty } from "@nestjs/swagger"
import { IsStrongPassword } from "../../../common/validators/is-strong-password"
import { NormalizeEmail } from "../../../common/validators/normalize-email"

export class RegisterDto {
  @ApiProperty({
    format: "email",
    description: "Trimmed and lowercased before storage.",
    example: "jane.doe@example.com",
  })
  @NormalizeEmail()
  email!: string

  @ApiProperty({
    format: "password",
    minLength: 12,
    maxLength: 128,
    description: "At least 12 characters with upper/lower case, a number and a special character.",
  })
  @IsStrongPassword()
  password!: string
}
