import { type APIError, createApiClient } from "@workspace/api-client"
import { toast } from "@workspace/ui"

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000"

export const apiClient = createApiClient(API_URL)

// Attach CSRF token for double-submit cookie pattern (required for POST /auth/refresh and POST /auth/logout)
apiClient.interceptors.request.use((config) => {
  if (typeof document !== "undefined") {
    const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/)
    const csrfToken = match ? decodeURIComponent(match[1]) : null
    if (csrfToken && config.headers) {
      ;(config.headers as Record<string, string>)["x-csrf-token"] = csrfToken
    }
  }
  return config
})

// Production-grade response handling: auto-refresh on 401, user-friendly toasts for auth errors
let refreshing: Promise<unknown> | null = null

async function tryRefresh(): Promise<boolean> {
  if (typeof document === "undefined") return false
  if (refreshing) {
    try {
      await refreshing
      return true
    } catch {
      return false
    }
  }
  const csrf = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/)?.[1]
    ? decodeURIComponent(document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/)![1])
    : null
  refreshing = apiClient.post("/auth/refresh", null, {
    headers: csrf ? { "x-csrf-token": csrf } : {},
  } as never)
  try {
    await refreshing
    return true
  } catch {
    return false
  } finally {
    refreshing = null
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: APIError) => {
    const status = error.response?.status ?? error.status
    const config = (error as unknown as { config?: Record<string, unknown> }).config as
      | (Record<string, unknown> & { _retry?: boolean; url?: string })
      | undefined

    // Silent refresh on 401 for non-auth endpoints (avoid loop on login/refresh itself)
    const isAuthUrl = typeof config?.url === "string" && /\/auth\/(login|refresh|register)/.test(config.url)
    if (status === 401 && config && !config._retry && !isAuthUrl) {
      config._retry = true
      const ok = await tryRefresh()
      if (ok) {
        // Re-attach fresh CSRF after rotation
        const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/)
        const csrfToken = match ? decodeURIComponent(match[1]) : null
        if (csrfToken && config.headers) {
          ;(config.headers as Record<string, string>)["x-csrf-token"] = csrfToken
        }
        return apiClient.request(config as never)
      }
    }

    if (status === 502 || status === 503) {
      toast.error("Server is currently unavailable. Please try again later.", { duration: 5000 })
    } else if (status === 423) {
      toast.error("Account locked after too many attempts. Try again later.", { duration: 6000 })
    } else if (status === 403) {
      const msg = (error.response?.data as { message?: string })?.message
      if (msg && /csrf/i.test(msg)) toast.error("Session expired. Please refresh the page.")
    }
    return Promise.reject(error)
  },
)
