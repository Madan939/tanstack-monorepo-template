import { Transform } from "class-transformer"
import { IsString, MaxLength, MinLength } from "class-validator"

export class OnboardingDto {
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  fullName!: string
}
