import { createFileRoute } from "@tanstack/react-router"
import type { IconName } from "@workspace/ui"
import { Button, Icon, icons } from "@workspace/ui"
import { useState } from "react"

export const Route = createFileRoute("/")({ component: App })

function App() {
  const [copiedName, setCopiedName] = useState<string | null>(null)

  const handleCopy = async (name: IconName) => {
    try {
      await navigator.clipboard.writeText(name)
      setCopiedName(name)
      window.setTimeout(() => setCopiedName(null), 1500)
    } catch (error) {
      console.error("Failed to copy icon name", error)
    }
  }

  return (
    <div className="min-h-svh bg-background p-6 text-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Icon catalog</h1>
          <Icon name="settings" />
          <p className="text-sm text-muted-foreground">
            Click any icon to copy its name to the clipboard.
          </p>
          {copiedName ? <p className="text-sm text-green-600">Copied: {copiedName}</p> : null}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Object.keys(icons).map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => handleCopy(name as IconName)}
              className="flex flex-col items-center justify-center gap-2 rounded-lg border border-border bg-card p-4 text-center text-xs transition hover:-translate-y-0.5 hover:border-primary hover:shadow-sm"
            >
              <Icon name={name as IconName} size={32} />
              <span className="break-all font-medium">{name}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline">Ready to use</Button>
          <span className="text-sm text-muted-foreground">
            {Object.keys(icons).length} icons available
          </span>
        </div>
      </div>
    </div>
  )
}
