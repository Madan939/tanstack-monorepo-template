import { applyDecorators, HttpStatus, type Type } from "@nestjs/common"
import { ApiResponse } from "@nestjs/swagger"
import { ErrorResponseDto } from "../dto/error-response.dto"

/**
 * Documents the standard {@link ErrorResponseDto} envelope for one or more
 * failure status codes, keeping controllers declarative and consistent.
 *
 * @example
 * @ApiErrors(
 *   [HttpStatus.UNAUTHORIZED, "Missing, malformed or expired credentials."],
 *   [HttpStatus.FORBIDDEN, "Email address is not verified."],
 * )
 */
export function ApiErrors(...errors: Array<[HttpStatus, string]>): MethodDecorator {
  return applyDecorators(
    ...errors.map(([status, description]) =>
      ApiResponse({ status, description, type: ErrorResponseDto as Type<ErrorResponseDto> }),
    ),
  )
}
