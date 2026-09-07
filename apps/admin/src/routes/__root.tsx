import { TanStackDevtools } from "@tanstack/react-devtools"
import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { asyncStoragePersister, QueryProvider } from "@workspace/query"
import { Toaster } from "@workspace/ui"
import appCss from "@workspace/ui/globals.css?url"
import { queryClient } from "../lib/query-client"

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "TanStack Start Starter",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: () => (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 p-8 text-center">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="text-sm text-muted-foreground">The page you are looking for does not exist.</p>
      <a href="/" className="text-sm text-primary underline-offset-4 hover:underline">
        Go to dashboard
      </a>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 p-8 text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="text-sm text-muted-foreground">{(error as Error)?.message ?? "Unexpected error"}</p>
      <a href="/" className="text-sm text-primary underline-offset-4 hover:underline">
        Go to dashboard
      </a>
    </div>
  ),
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="font-sans antialiased selection:bg-[rgba(79,184,178,0.24)]">
        <QueryProvider
          client={queryClient}
          persistOptions={{
            persister: asyncStoragePersister,
            maxAge: 1000 * 60 * 60 * 24,
            dehydrateOptions: {
              shouldDehydrateQuery: (query) => query.state.status === "success" && (query.meta as Record<string, unknown>)?.["persist"] === true,
            },
          }}
        >
          {children}
        </QueryProvider>
        <Toaster position="bottom-right" richColors closeButton duration={2500} />
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
