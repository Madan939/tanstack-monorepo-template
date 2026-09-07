import { ApiProperty } from "@nestjs/swagger"
import type { User } from "@prisma/client"

/**
 * Safe user projection returned by every endpoint. Never exposes the
 * password hash or internal bookkeeping fields.
 */
export class PublicUser {
  @ApiProperty({ format: "uuid", example: "11111111-1111-4111-8111-111111111111" })
  id!: string

  @ApiProperty({ example: "jane.doe@example.com", description: "Normalized (lowercase) email." })
  email!: string

  @ApiProperty({ nullable: true, type: String, example: "Jane Doe" })
  fullName!: string | null

  @ApiProperty({ example: true })
  emailVerified!: boolean

  @ApiProperty({
    example: true,
    description: "Soft-disable switch; deactivated users cannot authenticate.",
  })
  isActive!: boolean

  @ApiProperty({ example: "2026-08-22T12:00:00.000Z" })
  createdAt!: Date
}

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    emailVerified: user.emailVerified,
    isActive: user.isActive,
    createdAt: user.createdAt,
  }
}
