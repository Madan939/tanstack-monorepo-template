import { Controller, Get, HttpStatus, ServiceUnavailableException } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import { SkipThrottle } from "@nestjs/throttler"
import { ApiErrors } from "../../common/decorators/api-errors.decorator"
import { Public } from "../../common/decorators/public.decorator"
import { PrismaService } from "../../core/prisma/prisma.service"
import { HealthResponseDto } from "./dto/health-response.dto"

@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @SkipThrottle()
  @Public()
  @Get()
  @ApiOperation({
    summary: "Liveness / readiness probe",
    description: "Verifies that the process is up and can reach PostgreSQL.",
  })
  @ApiResponse({ status: 200, description: "Healthy.", type: HealthResponseDto })
  @ApiErrors([HttpStatus.SERVICE_UNAVAILABLE, "Database unreachable."])
  async check(): Promise<HealthResponseDto> {
    try {
      await this.prisma.$queryRaw`SELECT 1`
    } catch {
      throw new ServiceUnavailableException("Database is unavailable")
    }
    return { status: "ok", database: "up" }
  }
}
