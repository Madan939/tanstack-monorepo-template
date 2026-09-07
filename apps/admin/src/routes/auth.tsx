import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { fetchSession } from "../lib/session"

const authGuard = async ({ location }: { location: { pathname: string } }) => {
  const user = await fetchSession()
  const path = location.pathname

  if (!user) {
    // Not authenticated: allow everything except onboarding
    if (path === "/auth/onboarding") {
      throw redirect({ to: "/auth/login" })
    }
    return
  }

  // Authenticated
  if (!user.emailVerified) {
    // Needs verification: only allow verify-email
    if (path !== "/auth/verify-email") {
      throw redirect({ to: "/auth/verify-email" })
    }
    return
  }

  if (!user.fullName) {
    // Needs onboarding: only allow onboarding
    if (path !== "/auth/onboarding") {
      throw redirect({ to: "/auth/onboarding" })
    }
    return
  }

  // Fully set up: redirect away from all auth pages to dashboard
  throw redirect({ to: "/" })
}

export const Route = createFileRoute("/auth")({
  component: AuthLayout,
  beforeLoad: authGuard,
})

function AuthLayout() {
  return (
    <section className="grid grid-cols-2 gap-10">
      <div></div>
      <Outlet />
    </section>
  )
}