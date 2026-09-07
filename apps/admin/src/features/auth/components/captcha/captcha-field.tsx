import { Turnstile } from "@marsidev/react-turnstile"
import { useCaptcha } from "../../hooks/captcha/use-captcha"

type CaptchaFieldProps = {
  onVerifiedChange?: (verified: boolean) => void
}

export function CaptchaField({ onVerifiedChange }: CaptchaFieldProps) {
  const { enabled, siteKey, error, setError, loading, handleVerify } = useCaptcha({
    onVerifiedChange,
  })

  if (enabled === false || loading || !siteKey) {
    return null
  }

  return (
    <div className="w-full flex flex-col items-center justify-center my-1 [&_iframe]:w-full [&_iframe]:max-w-full">
      <Turnstile
        siteKey={siteKey}
        options={{
          theme: "light",
          size: "flexible",
        }}
        className="w-full"
        onSuccess={(token) => void handleVerify(token)}
        onError={(err) => setError(err ?? "Captcha challenge failed")}
      />
      {error ? <p className="text-xs text-destructive text-center mt-1">{error}</p> : null}
    </div>
  )
}
