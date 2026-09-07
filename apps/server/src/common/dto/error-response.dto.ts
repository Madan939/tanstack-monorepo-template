import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

/**
 * Uniform error envelope produced by AllExceptionsFilter for every failed
 * request. Internal details (stack traces, driver errors) are never exposed.
 */
export class ErrorResponseDto {
  @ApiProperty({ example: 401, description: "HTTP status code" })
  statusCode!: number

  @ApiProperty({
    description: "Human-readable message. Validation failures return an array of constraints.",
    oneOf: [{ type: "string" }, { type: "array", items: { type: "string" } }],
    example: "Invalid credentials",
  })
  message!: string | string[]

  @ApiPropertyOptional({
    description: "Reason phrase, e.g. 'Unauthorized' or 'Conflict'.",
    example: "Unauthorized",
  })
  error?: string

  @ApiProperty({ example: "/auth/login", description: "Request path that caused the error." })
  path!: string

  @ApiPropertyOptional({
    description: "Correlation id; also returned in the x-request-id response header.",
    oneOf: [{ type: "string" }, { type: "number" }],
    example: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  })
  requestId?: string | number

  @ApiProperty({ example: "2026-08-22T12:00:00.000Z", format: "date-time" })
  timestamp!: string
}
