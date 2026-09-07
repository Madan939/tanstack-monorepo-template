import { Transform } from "class-transformer"
import { IsOptional, IsString, MaxLength, MinLength } from "class-validator"

export class UpdateProfileDto {
  @IsOptional()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  fullName?: string
}
