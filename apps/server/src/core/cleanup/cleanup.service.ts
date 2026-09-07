import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common"
import { PinoLogger } from "nestjs-pino"
import { PrismaService } from "../prisma/prisma.service"

/**
 * Production-grade housekeeping: periodically purges expired sessions and
 * single-use tokens that are beyond their TTL. Prevents unbounded table growth
 * and reduces the surface for token-reuse attacks on stale rows.
 *
 * Runs every hour; initial run is staggered by 5 min after boot so it does
 * not contend with cold-start traffic. Failures are logged but never crash
 * the process.
 */
@Injectable()
export class CleanupService implements OnModuleInit, OnModuleDestroy {
  private timer?: ReturnType<typeof setInterval>
  private initialTimeout?: ReturnType<typeof setTimeout>

  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(CleanupService.name)
  }

  onModuleInit(): void {
    // Stagger first run to avoid boot contention
    this.initialTimeout = setTimeout(() => {
      void this.runOnce()
      this.timer = setInterval(() => void this.runOnce(), 60 * 60 * 1000) // every hour
      this.timer.unref?.()
    }, 5 * 60 * 1000)
    this.initialTimeout.unref?.()
    this.logger.info("cleanup scheduler armed (interval=1h, initial delay=5m)")
  }

  onModuleDestroy(): void {
    if (this.initialTimeout) clearTimeout(this.initialTimeout)
    if (this.timer) clearInterval(this.timer)
  }

  private async runOnce(): Promise<void> {
    const now = new Date()
    try {
      const [expiredSessions, expiredTokens] = await Promise.all([
        this.prisma.session.deleteMany({ where: { expiresAt: { lt: now }, revokedAt: { not: null } } }),
        this.prisma.token.deleteMany({ where: { expiresAt: { lt: now } } }),
      ])
      // Also purge revoked sessions that are past expiry + grace period (7 days)
      const graceCutoff = new Date(now.getTime() - 7 * 24 * 3600 * 1000)
      const staleRevoked = await this.prisma.session.deleteMany({
        where: { revokedAt: { not: null }, expiresAt: { lt: graceCutoff } },
      })
      const totalSessions = expiredSessions.count + staleRevoked.count
      if (totalSessions > 0 || expiredTokens.count > 0) {
        this.logger.info({ totalSessions, expiredTokens: expiredTokens.count }, "cleanup purged expired rows")
      }
    } catch (err) {
      this.logger.error({ err }, "cleanup run failed")
    }
  }
}
