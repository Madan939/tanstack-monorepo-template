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
        destructive: "bg-card text-destructive border-destructive/20 *:data-[slot=alert-description]:text-destructive/80",
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
    leftIcon?: IconName | React.ReactNode
    rightIcon?: IconName | React.ReactNode
    iconSize?: number
  }

function Alert({ className, variant, leftIcon, rightIcon, iconSize = 16, children, ...props }: AlertProps) {
  const renderIcon = (icon: IconName | React.ReactNode | undefined, position: "inline-start" | "inline-end") => {
    if (!icon) return null
    const node = isIconName(icon) ? <Icon name={icon} size={iconSize} aria-hidden decorative /> : icon
    return (
      <span data-icon={position} data-slot="alert-icon" aria-hidden="true" className="inline-flex shrink-0">
        {node}
      </span>
    )
  }

  return (
    <div data-slot="alert" role="alert" className={cn(alertVariants({ variant }), className)} {...props}>
      {renderIcon(leftIcon, "inline-start")}
      <div data-slot="alert-content" className="grid gap-1">
        {children}
      </div>
      {renderIcon(rightIcon, "inline-end")}
    </div>
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn("text-sm font-semibold [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground", className)}
      {...props}
    />
  )
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn("text-sm text-balance text-muted-foreground md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4", className)}
      {...props}
    />
  )
}

function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-action" className={cn("absolute top-2.5 right-3", className)} {...props} />
}

export { Alert, AlertAction, AlertDescription, AlertTitle }
