import { BadRequestException, NotFoundException } from "@nestjs/common"
import { UsersService } from "./users.service"

const userId = "11111111-1111-4111-8111-111111111111"

const makeUser = (overrides: Record<string, unknown> = {}) => ({
  id: userId,
  email: "jane@example.com",
  passwordHash: "h",
  fullName: "Jane Doe",
  emailVerified: true,
  isActive: true,
  failedLoginAttempts: 0,
  lockedUntil: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

describe("UsersService", () => {
  let service: UsersService
  let prisma: {
    user: Record<string, jest.Mock>
    session: Record<string, jest.Mock>
    $transaction: jest.Mock
  }
  const logger = { setContext: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() }

  beforeEach(() => {
    prisma = {
      user: { findUnique: jest.fn(), update: jest.fn(), findMany: jest.fn(), count: jest.fn() },
      session: { updateMany: jest.fn().mockResolvedValue({ count: 2 }) },
      $transaction: jest.fn(async (ops: unknown) => (Array.isArray(ops) ? Promise.all(ops) : ops)),
    }
    service = new UsersService(prisma as never, logger as never)
  })

  it("findById returns the public shape", async () => {
    prisma.user.findUnique.mockResolvedValue(makeUser())
    const user = await service.findById(userId)

    expect(user).toMatchObject({ id: userId, email: "jane@example.com" })
    expect(JSON.stringify(user)).not.toContain("passwordHash")
  })

  it("findById throws NotFound for missing users", async () => {
    prisma.user.findUnique.mockResolvedValue(null)
    await expect(service.findById(userId)).rejects.toThrow(NotFoundException)
  })

  it("updateProfile updates full name", async () => {
    const updated = makeUser({ fullName: "Alicia Doe" })
    prisma.user.update.mockResolvedValue(updated)

    const res = await service.updateProfile(userId, { fullName: "Alicia Doe" })

    expect(res.fullName).toBe("Alicia Doe")
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: userId },
      data: { fullName: "Alicia Doe" },
    })
  })

  describe("completeOnboarding", () => {
    it("sets fullName when onboarding is pending", async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser({ fullName: null }))
      const updated = makeUser({ fullName: "New User" })
      prisma.user.update.mockResolvedValue(updated)

      const res = await service.completeOnboarding(userId, { fullName: "New User" })

      expect(res.fullName).toBe("New User")
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { fullName: "New User" },
      })
    })

    it("rejects if email not verified", async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser({ emailVerified: false, fullName: null }))

      await expect(service.completeOnboarding(userId, { fullName: "New User" })).rejects.toThrow(
        BadRequestException,
      )
    })

    it("rejects if onboarding already completed", async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser({ fullName: "Existing Name" }))

      await expect(
        service.completeOnboarding(userId, { fullName: "Another Name" }),
      ).rejects.toThrow(BadRequestException)
    })
  })
})
