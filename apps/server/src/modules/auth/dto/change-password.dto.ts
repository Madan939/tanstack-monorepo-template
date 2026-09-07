import { ApiProperty } from "@nestjs/swagger"
import { IsString, MaxLength, MinLength } from "class-validator"
import { IsStrongPassword } from "../../../common/validators/is-strong-password"

export class ChangePasswordDto {
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  currentPassword!: string

  @ApiProperty({
    format: "password",
    minLength: 12,
    maxLength: 128,
    description: "At least 12 characters with upper/lower case, a number and a special character.",
  })
  @IsStrongPassword()
  newPassword!: string
}
