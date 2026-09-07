import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common"
import { PinoLogger } from "nestjs-pino"
import { PrismaService } from "../../core/prisma/prisma.service"
import { OnboardingDto } from "./dto/onboarding.dto"
import { PublicUser, toPublicUser } from "./dto/public-user.dto"
import { UpdateProfileDto } from "./dto/update-profile.dto"

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(UsersService.name)
  }

  async findById(id: string): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) throw new NotFoundException("User not found")
    return toPublicUser(user)
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<PublicUser> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName: dto.fullName ?? undefined,
      },
    })
    return toPublicUser(user)
  }

  async completeOnboarding(userId: string, dto: OnboardingDto): Promise<PublicUser> {
    const existing = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!existing) throw new NotFoundException("User not found")
    if (!existing.emailVerified) {
      throw new BadRequestException("Email must be verified before onboarding")
    }
    if (existing.fullName) {
      throw new BadRequestException("Onboarding already completed")
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { fullName: dto.fullName.trim() },
    })
    this.logger.info({ userId }, "user completed onboarding")
    return toPublicUser(user)
  }
}
