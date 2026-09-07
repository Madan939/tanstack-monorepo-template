import { ApiProperty } from "@nestjs/swagger"
import { IsString, MaxLength, MinLength } from "class-validator"
import { NormalizeEmail } from "../../../common/validators/normalize-email"

export class LoginDto {
  @ApiProperty({
    format: "email",
    description: "Trimmed and lowercased before lookup.",
    example: "jane.doe@example.com",
  })
  @NormalizeEmail()
  email!: string

  @IsString()
  @MinLength(1)
  @MaxLength(128)
  password!: string
}
