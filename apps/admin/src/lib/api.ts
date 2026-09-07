const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000"

type ApiOptions = RequestInit & { token?: string }

/** Reads the double-submit CSRF token from the readable `csrf_token` cookie. */
export function getCsrfToken(): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : null
}

/** Clears all client-side session artifacts: localStorage, sessionStorage and readable cookies. */
export function clearClientSession(): void {
  if (typeof window === "undefined") return

  // Preserve theme preference - everything else is session/cached state
  const theme = (() => {
    try {
      return localStorage.getItem("theme")
    } catch {
      return null
    }
  })()

  try {
    localStorage.clear()
    sessionStorage.clear()
    if (theme) localStorage.setItem("theme", theme)
  } catch {
    // ignore storage errors (e.g. private mode)
  }

  // Expire all readable cookies on common paths - httpOnly cookies are cleared by the server via Set-Cookie
  try {
    for (const cookie of document.cookie.split(";")) {
      const eqIdx = cookie.indexOf("=")
      const name = eqIdx > -1 ? cookie.slice(0, eqIdx).trim() : cookie.trim()
      if (!name) continue
      // Skip if already expired; set past date for "/" and current path
      document.cookie = `${name}=; Max-Age=0; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
      document.cookie = `${name}=; Max-Age=0; path=/auth; expires=Thu, 01 Jan 1970 00:00:00 GMT`
      // Also try without domain restriction
      const hostname = window.location.hostname
      if (hostname !== "localhost" && hostname !== "127.0.0.1") {
        document.cookie = `${name}=; Max-Age=0; path=/; domain=${hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT`
      }
    }
  } catch {
    // ignore cookie errors
  }
}

/** Calls POST /auth/logout with CSRF header and clears client-side state. Always resolves - never throws for probing resistance. */
export async function logout(): Promise<void> {
  const csrf = getCsrfToken()
  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(csrf ? { "x-csrf-token": csrf } : {}),
      },
    })
  } catch {
    // Network failure - still clear client side so user isn't stuck
  } finally {
    clearClientSession()
  }
}

/** Calls POST /auth/logout-all (revokes every session) and clears client-side state. */
export async function logoutAll(): Promise<void> {
  try {
    await fetch(`${API_URL}/auth/logout-all`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
  } catch {
    // ignore - still clear client side
  } finally {
    clearClientSession()
  }
}

export async function api<T extends Record<string, unknown>>(path: string, options: ApiOptions = {}): Promise<T> {
  const { token, headers, ...rest } = options
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers as Record<string, string>),
    },
    ...rest,
  })

  const data: unknown = await res.json().catch(() => ({} as Record<string, unknown>))

  if (!res.ok) {
    const maybeMessage = (data as { message?: unknown })?.message
    const message = Array.isArray(maybeMessage)
      ? (maybeMessage as string[]).join(", ")
      : typeof maybeMessage === "string"
        ? maybeMessage
        : `Request failed: ${res.status}`
    throw new Error(message)
  }

  return data as T
}
