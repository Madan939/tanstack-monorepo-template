import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString, MaxLength } from "class-validator"

export class VerifyCaptchaDto {
  @ApiProperty({
    description: "Cloudflare Turnstile token (response) from the widget",
    example: "0.Abc123...",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(4096)
  token!: string
}
