import "./src/load-env"

import { randomUUID } from "node:crypto"
import { PrismaClient } from "@prisma/client"
import * as argon2 from "argon2"

/**
 * Idempotent seed: creates a verified user from env:
 *   SEED_USER_EMAIL=user@example.com
 *   SEED_USER_PASSWORD=<strong password>
 * Run with: pnpm db:seed
 */
async function main(): Promise<void> {
  const email = (process.env.SEED_USER_EMAIL ?? process.env.SEED_ADMIN_EMAIL)?.trim().toLowerCase()
  const password = process.env.SEED_USER_PASSWORD ?? process.env.SEED_ADMIN_PASSWORD ?? ""

  if (!email || !password) {
    console.error("SEED_USER_EMAIL and SEED_USER_PASSWORD are required")
    process.exit(1)
  }
  if (
    password.length < 12 ||
    !/[a-z]/.test(password) ||
    !/[A-Z]/.test(password) ||
    !/\d/.test(password) ||
    !/[^A-Za-z0-9]/.test(password)
  ) {
    console.error("SEED_USER_PASSWORD must be >= 12 chars with upper/lower/digit/special")
    process.exit(1)
  }

  const prisma = new PrismaClient()
  try {
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
    })
    const user = await prisma.user.upsert({
      where: { email },
      update: { isActive: true, emailVerified: true },
      create: {
        id: randomUUID(),
        email,
        passwordHash,
        fullName: "Seed User",
        emailVerified: true,
      },
    })
    console.log(`User ready: ${user.email} (${user.id})`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
