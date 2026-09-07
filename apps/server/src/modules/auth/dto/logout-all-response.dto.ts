import { ApiProperty } from "@nestjs/swagger"

export class LogoutAllResponseDto {
  @ApiProperty({ example: 3, description: "Number of active sessions revoked." })
  revokedSessions!: number
}
