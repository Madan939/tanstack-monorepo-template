import { ApiProperty } from "@nestjs/swagger"
import { PublicUser } from "../../users/dto/public-user.dto"

/**
 * Body returned by POST /auth/login and POST /auth/refresh. The rotating
 * refresh token is delivered exclusively via a httpOnly cookie scoped to
 * /auth - it is never present in this payload.
 */
export class AuthSessionResponseDto {
  @ApiProperty({ type: PublicUser })
  user!: PublicUser

  @ApiProperty({
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.<payload>.<signature>",
    description: "JWT access token; send as `Authorization: Bearer <token>`.",
  })
  accessToken!: string

  @ApiProperty({ example: 900, description: "Access-token lifetime in seconds." })
  expiresIn!: number

  @ApiProperty({
    example: "qU4h2Z0PzK1vXw7nRj3sLd8yTb6mCe9fGa5iO0rHkA",
    description:
      "Double-submit CSRF token; also stored in the readable csrf_token cookie. Echo it back in the x-csrf-token header for cookie-authenticated calls.",
  })
  csrfToken!: string
}
