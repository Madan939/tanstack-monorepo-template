import { createServerFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"
import { z } from "zod"
import { CONFIG } from "#/config"


const sessionUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  fullName: z.string().nullable(),
  emailVerified: z.boolean(),
  isActive: z.boolean().optional(),
})

export type SessionUser = z.infer<typeof sessionUserSchema>

function getCsrfFromCookie(cookie: string | null): string | null {
  if (!cookie) return null
  const m = cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/)
  return m ? decodeURIComponent(m[1]) : null
}

export const fetchSession = createServerFn({ method: "GET" }).handler(async (): Promise<SessionUser | null> => {
  const request = getRequest()
  const cookie = request.headers.get("cookie")

  const doFetch = async (cookieHeader: string | null) =>
    fetch(`${CONFIG.API_URL}${CONFIG.ENDPOINTS.AUTH.ME}`, {
      headers: {
        Accept: "application/json",
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
    })

  try {
    let res = await doFetch(cookie ?? null)

    // Production-grade: try silent refresh on 401 before giving up (rotating refresh token)
    if (res.status === 401 && cookie) {
      const csrf = getCsrfFromCookie(cookie)
      try {
        const refreshRes = await fetch(`${CONFIG.API_URL}/auth/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(csrf ? { "x-csrf-token": csrf } : {}),
            ...(cookie ? { Cookie: cookie } : {}),
          },
        })
        if (refreshRes.ok) {
          // Merge new cookies from refresh into the cookie header for retry
          const setCookie = refreshRes.headers.getSetCookie?.() ?? []
          let mergedCookie = cookie ?? ""
          for (const sc of setCookie) {
            const pair = sc.split(";")[0] ?? ""
            const eq = pair.indexOf("=")
            if (eq === -1) continue
            const name = pair.slice(0, eq).trim()
            const value = pair.slice(eq + 1)
            const re = new RegExp(`(?:^|;\\s*)${name.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}=([^;]*)`)
            if (re.test(mergedCookie)) mergedCookie = mergedCookie.replace(re, `${name}=${value}`)
            else mergedCookie = mergedCookie ? `${mergedCookie}; ${name}=${value}` : `${name}=${value}`
          }
          res = await doFetch(mergedCookie)
          // Note: refreshed cookies are set via Set-Cookie on refresh response and will be
          // propagated to the browser by the owning request; TanStack Start handles this.
        }
      } catch {
        // refresh failed - treat as unauthenticated
      }
    }

    if (!res.ok) return null
    const data: unknown = await res.json()
    const parsed = sessionUserSchema.safeParse(data)
    if (!parsed.success) {
      console.error("fetchSession validation error:", parsed.error)
      return null
    }
    return parsed.data
  } catch (err: unknown) {
    console.error("fetchSession error:", err)
    return null
  }
})
