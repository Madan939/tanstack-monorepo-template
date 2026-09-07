import type { APIError } from "@workspace/api-client"
import { useEffect, useState } from "react"
import { turnstileApiService } from "../../services/turnstile-api.services"

type UseCaptchaOptions = {
  onVerifiedChange?: (verified: boolean) => void
}

export function useCaptcha(options?: UseCaptchaOptions) {
  const { onVerifiedChange } = options ?? {}
  const [enabled, setEnabled] = useState<boolean | null>(null)
  const [siteKey, setSiteKey] = useState<string>("")
  const [verified, setVerified] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const checkConfig = async () => {
      const hasCookie = typeof document !== "undefined" && document.cookie.includes("captcha_verified=1")

      if (hasCookie) {
        setVerified(true)
        onVerifiedChange?.(true)
        setLoading(false)
        return
      }

      try {
        const res = await turnstileApiService.getConfig()
        const data = res.data
        setEnabled(data.enabled)
        if (!data.enabled) {
          setVerified(true)
          onVerifiedChange?.(true)
        } else {
          setSiteKey(data.siteKey)
          onVerifiedChange?.(false)
        }
      } catch {
        setVerified(true)
        onVerifiedChange?.(true)
      } finally {
        setLoading(false)
      }
    }

    void checkConfig()
  }, [onVerifiedChange])

  const handleVerify = async (token: string) => {
    try {
      await turnstileApiService.verify({ token })
      setVerified(true)
      setError(null)
      const isSecure = typeof window !== "undefined" && window.location.protocol === "https:"
      document.cookie = `captcha_verified=1; path=/; max-age=${60 * 5}; ${isSecure ? "secure;" : ""}`
      onVerifiedChange?.(true)
    } catch (err: unknown) {
      const apiErr = err as APIError<{ message?: string | string[]; error?: string }>
      const rawMsg = apiErr.response?.data?.message ?? apiErr.response?.data?.error ?? apiErr.message
      const msg = Array.isArray(rawMsg) ? rawMsg.join(", ") : (rawMsg ?? "Captcha verification failed")
      setError(msg)
      onVerifiedChange?.(false)
    }
  }

  return {
    enabled,
    siteKey,
    verified,
    error,
    setError,
    loading,
    handleVerify,
  }
}
