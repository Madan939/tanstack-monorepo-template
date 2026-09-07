import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/")({
  component: App,
})

function App() {
  const { user } = Route.useRouteContext()

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p className="mt-4 text-muted-foreground">Welcome back, {user.fullName || user.email}!</p>
      <div className="mt-8 border rounded-lg p-6 bg-card">
        This is your admin root page. You are authenticated and your email is verified.
      </div>
    </main>
  )
}
