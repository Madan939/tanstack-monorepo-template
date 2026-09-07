import { Body, Controller, Get, HttpStatus, Patch, Post } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import { SkipThrottle } from "@nestjs/throttler"
import { ApiErrors } from "../../common/decorators/api-errors.decorator"
import { type AuthenticatedUser, CurrentUser } from "../../common/decorators/current-user.decorator"
import { OnboardingDto } from "./dto/onboarding.dto"
import { PublicUser } from "./dto/public-user.dto"
import { UpdateProfileDto } from "./dto/update-profile.dto"
import { UsersService } from "./users.service"

@ApiTags("user")
@ApiBearerAuth("access-token")
@Controller("user")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @SkipThrottle()
  @Get("me")
  @ApiOperation({ summary: "Get the authenticated user's profile" })
  @ApiResponse({ status: 200, type: PublicUser })
  @ApiErrors([HttpStatus.UNAUTHORIZED, "Missing or invalid access token."])
  me(@CurrentUser() user: AuthenticatedUser): Promise<PublicUser> {
    return this.usersService.findById(user.sub)
  }

  @Patch("me")
  @ApiOperation({ summary: "Update the authenticated user's profile" })
  @ApiResponse({ status: 200, description: "Updated profile.", type: PublicUser })
  @ApiErrors(
    [HttpStatus.BAD_REQUEST, "Request body failed validation."],
    [HttpStatus.UNAUTHORIZED, "Missing or invalid access token."],
  )
  updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ): Promise<PublicUser> {
    return this.usersService.updateProfile(user.sub, dto)
  }

  @Post("onboarding")
  @ApiOperation({
    summary: "Complete onboarding",
    description:
      "Sets the user's full name. Requires a verified email and can only be completed once. Call this after email verification.",
  })
  @ApiResponse({ status: 201, description: "Onboarding completed.", type: PublicUser })
  @ApiErrors(
    [HttpStatus.BAD_REQUEST, "Email not verified or onboarding already completed."],
    [HttpStatus.UNAUTHORIZED, "Missing or invalid access token."],
  )
  completeOnboarding(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: OnboardingDto,
  ): Promise<PublicUser> {
    return this.usersService.completeOnboarding(user.sub, dto)
  }
}
