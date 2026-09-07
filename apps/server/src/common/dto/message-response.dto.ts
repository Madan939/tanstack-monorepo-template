import { ApiProperty } from "@nestjs/swagger"

/**
 * Standard body for endpoints whose only outcome is a human-readable,
 * enumeration-safe status message.
 */
export class MessageResponseDto {
  @ApiProperty({ example: "Signed out" })
  message!: string
}
