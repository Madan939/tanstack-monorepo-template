import { type IconName, icons } from "@workspace/ui/components/icons/registry"
import { Icon } from "@workspace/ui/components/shared/icon"
import { cn } from "@workspace/ui/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

const alertVariants = cva(
  "group/alert relative grid w-full gap-1 rounded-xl border bg-card px-4 py-3 text-left text-sm ring-1 ring-border/50 has-data-[slot=alert-action]:pr-16 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2.5 *:[svg]:row-span-2 *:[svg]:mt-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground border-border",
        destructive:
          "bg-card text-destructive border-destructive/20 *:data-[slot=alert-description]:text-destructive/80",
        // International Standard — Semantic
        info: "bg-info/10 text-info border-info/20 *:data-[slot=alert-description]:text-info/80 [&_svg]:text-info", // blue — informational, help, tips
        success:
          "bg-success/10 text-success border-success/20 *:data-[slot=alert-description]:text-success/80 [&_svg]:text-success", // green — success, completed, verified
        warning:
          "bg-warning/15 text-warning-foreground border-warning/30 *:data-[slot=alert-description]:text-warning-foreground/80 [&_svg]:text-warning", // amber — warning, caution, pending review
        neutral:
          "bg-neutral/30 text-neutral-foreground border-neutral/40 *:data-[slot=alert-description]:text-neutral-foreground/80 [&_svg]:text-neutral-foreground", // gray — neutral, inactive, secondary info
        // Extended Color Scales
        indigo:
          "bg-indigo-light text-indigo-light-foreground border-indigo-border *:data-[slot=alert-description]:text-indigo-light-foreground/80 [&_svg]:text-indigo",
        violet:
          "bg-violet-light text-violet-light-foreground border-violet-border *:data-[slot=alert-description]:text-violet-light-foreground/80 [&_svg]:text-violet",
        rose: "bg-rose-light text-rose-light-foreground border-rose-border *:data-[slot=alert-description]:text-rose-light-foreground/80 [&_svg]:text-rose",
        cyan: "bg-cyan-light text-cyan-light-foreground border-cyan-border *:data-[slot=alert-description]:text-cyan-light-foreground/80 [&_svg]:text-cyan",
        amber:
          "bg-amber-light text-amber-light-foreground border-amber-border *:data-[slot=alert-description]:text-amber-light-foreground/80 [&_svg]:text-amber",
      },
    },
    defaultVariants: { variant: "default" },
  },
)

function isIconName(value: unknown): value is IconName {
  return typeof value === "string" && value in icons
}

type AlertProps = React.ComponentProps<"div"> &
  VariantProps<typeof alertVariants> & {
    /** Icon at start (RTL-aware) */
    startIcon?: IconName | React.ReactNode
    /** Icon at end (RTL-aware) */
    endIcon?: IconName | React.ReactNode
    iconSize?: number
  }

function Alert({
  className,
  variant,
  startIcon,
  endIcon,
  iconSize = 16,
  children,
  ...props
}: AlertProps) {
  const renderIcon = (
    icon: IconName | React.ReactNode | undefined,
    position: "inline-start" | "inline-end",
  ) => {
    if (!icon) return null
    const node = isIconName(icon) ? (
      <Icon name={icon} size={iconSize} aria-hidden decorative />
    ) : (
      icon
    )
    return (
      <span
        data-icon={position}
        data-slot="alert-icon"
        aria-hidden="true"
        className="inline-flex shrink-0"
      >
        {node}
      </span>
    )
  }

  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {renderIcon(startIcon, "inline-start")}
      <div data-slot="alert-content" className="grid gap-1">
        {children}
      </div>
      {renderIcon(endIcon, "inline-end")}
    </div>
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "text-sm font-semibold [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground",
        className,
      )}
      {...props}
    />
  )
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-sm text-balance text-muted-foreground md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
        className,
      )}
      {...props}
    />
  )
}

function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn("absolute top-2.5 right-3", className)}
      {...props}
    />
  )
}

export { Alert, AlertAction, AlertDescription, AlertTitle }
