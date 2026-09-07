import { Turnstile } from "@marsidev/react-turnstile"
import { useEffect, useState } from "react"

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000"

type CaptchaFieldProps = {
  onVerifiedChange?: (verified: boolean) => void
}

export function CaptchaField({ onVerifiedChange }: CaptchaFieldProps) {
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
        const res = await fetch(`${API_URL}/turnstile/config`, { credentials: "include" })
        if (res.ok) {
          const data = (await res.json()) as { enabled: boolean; siteKey: string }
          setEnabled(data.enabled)
          if (!data.enabled) {
            setVerified(true)
            onVerifiedChange?.(true)
          } else {
            setSiteKey(data.siteKey)
            onVerifiedChange?.(false)
          }
        } else {
          setVerified(true)
          onVerifiedChange?.(true)
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
      const res = await fetch(`${API_URL}/turnstile/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token }),
      })
      const data = (await res.json()) as { message?: string }
      if (res.ok) {
        setVerified(true)
        setError(null)
        const isSecure = typeof window !== "undefined" && window.location.protocol === "https:"
        document.cookie = `captcha_verified=1; path=/; max-age=${60 * 5}; ${isSecure ? "secure;" : ""}`
        onVerifiedChange?.(true)
      } else {
        setError(data.message ?? "Captcha verification failed")
        onVerifiedChange?.(false)
      }
    } catch {
      setError("Error verifying captcha")
      onVerifiedChange?.(false)
    }
  }

  if (loading || enabled === false) {
    return null
  }

  if (verified) {
    return (
      <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium py-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span>Security check passed</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center gap-2 py-2">
      {siteKey ? (
        <Turnstile
          siteKey={siteKey}
          onSuccess={(token) => void handleVerify(token)}
          onError={(err) => setError(err ?? "Captcha challenge failed")}
        />
      ) : (
        <p className="text-xs text-destructive">Captcha site key missing</p>
      )}
      {error && (
        <p className="text-xs text-destructive text-center">{error}</p>
      )}
    </div>
  )
}
