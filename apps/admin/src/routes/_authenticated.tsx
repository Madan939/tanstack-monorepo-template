import { createFileRoute, Outlet, redirect, useRouter } from "@tanstack/react-router"
import { useEffect } from "react"
import { AuthenticatedShell } from "#/components/app-sidebar"
import { useLogoutAllMutation, useLogoutMutation } from "#/features/auth/hooks/mutation"
import { fetchSession } from "../lib/session"

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    const user = await fetchSession()

    if (!user) {
      // Only remember the attempted location if it is not the dashboard itself
      throw redirect({
        to: "/auth/login",
        search: location.href === "/" ? {} : { redirect: location.href },
      })
    }

    // Production-grade: enforce deactivation at the edge (SSR)
    if (user.isActive === false) {
      throw redirect({ to: "/auth/login", search: { redirect: location.href } })
    }

    if (!user.emailVerified) {
      throw redirect({
        to: "/auth/verify-email",
      })
    }

    if (!user.fullName) {
      throw redirect({
        to: "/auth/onboarding",
      })
    }

    return { user }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const { user } = Route.useRouteContext()
  const router = useRouter()
  const logoutMutation = useLogoutMutation()
  const logoutAllMutation = useLogoutAllMutation()
  const isLoggingOut = logoutMutation.isPending || logoutAllMutation.isPending

  useEffect(() => {
    return () => {
      // Clear theme styles when navigating away from protected pages
      const root = document.documentElement
      root.classList.remove("light", "dark")
      root.removeAttribute("data-theme")
      root.style.colorScheme = ""
    }
  }, [])

  const handleLogout = () => {
    if (isLoggingOut) return
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        router.invalidate()
        window.location.href = "/auth/login"
      },
    })
  }

  const handleLogoutAll = () => {
    if (isLoggingOut) return
    logoutAllMutation.mutate(undefined, {
      onSettled: () => {
        router.invalidate()
        window.location.href = "/auth/login"
      },
    })
  }

  return (
    <AuthenticatedShell user={user} onLogout={handleLogout} onLogoutAll={handleLogoutAll} isLoggingOut={isLoggingOut}>
      <Outlet />
    </AuthenticatedShell>
  )
}
