import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common"
import { Prisma } from "@prisma/client"
import type { Request, Response } from "express"

interface ErrorBody {
  statusCode: number
  message: string | string[]
  error?: string
  path: string
  requestId?: string | number
  timestamp: string
}

/**
 * Global exception filter. Guarantees a consistent JSON error envelope and,
 * critically, never leaks internals (stack traces, driver errors, queries)
 * to the client. Unexpected errors are logged with full detail server-side.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let message: string | string[] = "An unexpected error occurred"
    let error: string | undefined

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      const body = exception.getResponse()
      if (typeof body === "string") {
        message = body
      } else if (typeof body === "object" && body !== null) {
        const b = body as Record<string, unknown>
        if (typeof b.message === "string" || Array.isArray(b.message))
          message = b.message as string | string[]
        error = typeof b.error === "string" ? b.error : undefined
      }
      if (!error) error = HttpStatus[status]?.replace(/_/g, " ")
    } else if (
      exception instanceof Prisma.PrismaClientKnownRequestError ||
      (exception as object)?.constructor?.name === "PrismaClientKnownRequestError"
    ) {
      const code = (exception as Prisma.PrismaClientKnownRequestError).code
      // Map known DB constraint violations to safe, generic client errors.
      if (code === "P2002") {
        status = HttpStatus.CONFLICT
        message = "Resource already exists"
        error = "Conflict"
      } else if (code === "P2025") {
        status = HttpStatus.NOT_FOUND
        message = "Resource not found"
        error = "Not Found"
      }
    }

    if (status >= 500) {
      this.logger.error(
        `Unhandled exception on ${request.method} ${request.originalUrl}: ${
          exception instanceof Error ? exception.stack : String(exception)
        }`,
      )
    }

    const body: ErrorBody = {
      statusCode: status,
      message,
      ...(error ? { error } : {}),
      path: request.originalUrl,
      // Assigned by nestjs-pino's request-id middleware.
      requestId: typeof request.id === "object" ? undefined : request.id,
      timestamp: new Date().toISOString(),
    }

    response.status(status).json(body)
  }
}
