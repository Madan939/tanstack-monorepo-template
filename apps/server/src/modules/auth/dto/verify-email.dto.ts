import { ApiProperty } from "@nestjs/swagger"
import { Matches } from "class-validator"
import { NormalizeEmail } from "../../../common/validators/normalize-email"

export class VerifyEmailDto {
  @ApiProperty({ format: "email", example: "jane.doe@example.com" })
  @NormalizeEmail()
  email!: string

  /** 6-digit numeric verification code. */
  @ApiProperty({ example: "482193", description: "6-digit code, expires in 10 minutes" })
  @Matches(/^\d{6}$/, { message: "code must be a 6-digit number" })
  code!: string
}
