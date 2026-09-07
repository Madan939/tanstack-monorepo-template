import { Inject, Injectable } from "@nestjs/common"
import { Logger } from "nestjs-pino"
import type { AppConfig } from "../../config/configuration"
import { CONFIG } from "../../config/configuration"

interface SendOptions {
  to: string
  subject: string
  text: string
  html: string
}

/**
 * Transactional email delivery via the Resend HTTP API.
 *
 * - `RESEND_API_KEY` set  → emails are delivered through Resend.
 * - `RESEND_API_KEY` empty → emails are rendered to the application log
 *   instead of being sent (development / CI), keeping the full flow testable
 *   without external infrastructure.
 */
@Injectable()
export class MailService {
  private readonly apiKey: string | null

  constructor(
    private readonly logger: Logger,
    @Inject(CONFIG) private readonly appConfig: AppConfig,
  ) {
    this.apiKey = process.env.RESEND_API_KEY?.trim() || null
  }

  async sendVerificationEmail(to: string, code: string): Promise<void> {
    await this.send({
      to,
      subject: "Your verification code",
      text: `Welcome! Your verification code is ${code}. It expires in 10 minutes.\n\nEnter this code on the verification page to confirm your email.\n\nIf you did not create an account, you can safely ignore this email.`,
      html: `<p>Welcome!</p>
<p>Your verification code is <strong style="font-size:20px;letter-spacing:4px;">${code}</strong></p>
<p>This code expires in <strong>10 minutes</strong>. Enter it on the verification page to confirm your email.</p>
<p>If you did not create an account, you can safely ignore this email.</p>`,
    })
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    await this.send({
      to,
      subject: "Reset your password",
      text: `We received a request to reset your password. Open the link below to choose a new one:\n\n${this.appConfig.appUrl}/auth/reset-password?token=${token}\n\nIf you did not request a reset, you can safely ignore this email - your password will remain unchanged.`,
      html: `<p>We received a request to reset your password.</p>
<p><a href="${this.appConfig.appUrl}/auth/reset-password?token=${token}">Choose a new password</a></p>
<p>If you did not request a reset, you can safely ignore this email - your password will remain unchanged.</p>`,
    })
  }

  async sendPasswordChangedEmail(to: string): Promise<void> {
    await this.send({
      to,
      subject: "Your password was changed",
      text: "Your account password was just changed and all active sessions were signed out. If this wasn't you, please reset your password immediately.",
      html: "<p>Your account password was just changed and all active sessions were signed out.</p><p>If this wasn't you, please reset your password immediately.</p>",
    })
  }

  // -- internals ---------------------------------------------------------------

  private async send(options: SendOptions): Promise<void> {
    if (!this.apiKey) {
      this.logger.warn(
        {
          event: "email.logged",
          to: options.to,
          bcc: this.appConfig.mail.bcc || undefined,
          subject: options.subject,
          bodyText: options.text,
        },
        "RESEND_API_KEY not configured - rendering email to log",
      )
      return
    }
    // Resend testing mode only allows sending to the account owner (norbeylama@gmail.com).
    // In development, redirect non-owner recipients to the owner so the mail appears in Resend dashboard.
    const RESEND_TEST_OWNER = "norbeylama@gmail.com"
    const isTestingMode = this.appConfig.env !== "production"
    const shouldRedirectToOwner = isTestingMode && options.to.toLowerCase() !== RESEND_TEST_OWNER.toLowerCase()

    const effectiveTo = shouldRedirectToOwner ? RESEND_TEST_OWNER : options.to
    const effectiveSubject = shouldRedirectToOwner ? `[${options.to}] ${options.subject}` : options.subject
    const effectiveText = shouldRedirectToOwner
      ? `Intended recipient: ${options.to}\n\n${options.text}`
      : options.text
    const effectiveHtml = shouldRedirectToOwner
      ? `<p><strong>Intended recipient: ${options.to}</strong></p>${options.html}`
      : options.html

    if (shouldRedirectToOwner) {
      this.logger.warn(
        {
          event: "email.redirected_for_resend_testing",
          originalTo: options.to,
          effectiveTo,
        },
        "Resend testing mode: redirecting email to owner so it appears in Resend dashboard",
      )
    }

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: this.appConfig.mail.from,
          to: [effectiveTo],
          bcc: this.appConfig.mail.bcc ? [this.appConfig.mail.bcc] : undefined,
          subject: effectiveSubject,
          html: effectiveHtml,
          text: effectiveText,
        }),
      })

      if (!res.ok) {
        const body = await res.text().catch(() => "")
        // Never bubble transport failures into user-facing flows.
        this.logger.error({ status: res.status, body, to: options.to, effectiveTo }, "Resend delivery failed")
        // In development, also log the email content so verification can be completed without a verified domain
        if (this.appConfig.env !== "production") {
          this.logger.warn(
            {
              event: "email.logged.fallback",
              to: options.to,
              effectiveTo,
              subject: options.subject,
              bodyText: options.text,
              resendStatus: res.status,
              resendBody: body,
            },
            "Resend failed - rendering email to log as fallback (dev only)",
          )
        }
      } else {
        const resBody = await res.text().catch(() => "")
        this.logger.log({ to: options.to, effectiveTo, subject: options.subject, resBody }, "email sent via Resend")
      }
    } catch (err) {
      this.logger.error({ err }, `Failed to send email to ${options.to}`)
      if (this.appConfig.env !== "production") {
        this.logger.warn(
          {
            event: "email.logged.fallback",
            to: options.to,
            subject: options.subject,
            bodyText: options.text,
          },
          "Resend exception - rendering email to log as fallback (dev only)",
        )
      }
    }
  }
}
