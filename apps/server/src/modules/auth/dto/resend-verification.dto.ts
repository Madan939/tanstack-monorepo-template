import { ApiProperty } from "@nestjs/swagger"
import { NormalizeEmail } from "../../../common/validators/normalize-email"

export class ResendVerificationDto {
  @ApiProperty({ format: "email", example: "jane.doe@example.com" })
  @NormalizeEmail()
  email!: string
}
