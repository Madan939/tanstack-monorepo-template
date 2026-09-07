import { type IconName, icons } from "@workspace/ui/components/icons/registry"
import { Icon } from "@workspace/ui/components/shared/icon"
import { cn } from "@workspace/ui/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import * as React from "react"

const badgeVariants = cva(
  "group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 [&_svg]:pointer-events-none [&_svg]:size-3",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "border-border bg-background text-foreground",
        ghost: "border-transparent bg-muted text-muted-foreground",
      },
      size: {
        default: "px-2 py-0.5 text-xs",
        sm: "px-1.5 py-0.5 text-[11px]",
        lg: "px-2.5 py-1 text-sm",
      },
      radius: {
        default: "rounded-md",
        rounded: "rounded-full",
      },
    },
    defaultVariants: { variant: "default", size: "default", radius: "default" },
  },
)

const badgeDotVariants = cva("shrink-0 rounded-full bg-current", {
  variants: {
    variant: {
      default: "text-primary",
      secondary: "text-secondary-foreground",
      destructive: "text-destructive",
      outline: "text-foreground",
      ghost: "text-muted-foreground",
    },
    size: {
      default: "size-1.5",
      sm: "size-1",
      lg: "size-2",
    },
  },
  defaultVariants: { variant: "default", size: "default" },
})

function isIconName(value: unknown): value is IconName {
  return typeof value === "string" && value in icons
}

type BadgeProps = React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean
    leftIcon?: IconName | React.ReactNode
    rightIcon?: IconName | React.ReactNode
    iconSize?: number
    dot?: boolean
    dotVariant?: VariantProps<typeof badgeDotVariants>["variant"]
    dotClassName?: string
    removable?: boolean
    onRemove?: () => void
    outline?: boolean
  }

function Badge({
  className,
  variant = "default",
  size,
  radius,
  asChild = false,
  leftIcon,
  rightIcon,
  iconSize = 12,
  dot = false,
  dotVariant,
  removable = false,
  onRemove,
  outline = false,
  children,
  dotClassName,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot.Root : "span"
  const outlineClasses = outline ? "bg-transparent border-border" : ""
  const finalDotVariant = dotVariant ?? variant

  const renderIcon = (
    icon: IconName | React.ReactNode | undefined,
    position: "inline-start" | "inline-end",
  ) => {
    if (!icon) return null
    const node = isIconName(icon) ? <Icon name={icon} size={iconSize} aria-hidden decorative /> : icon
    return (
      <span data-icon={position} data-slot="badge-icon" aria-hidden="true" className="inline-flex shrink-0 items-center">
        {node}
      </span>
    )
  }

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      data-size={size}
      data-radius={radius}
      className={cn(badgeVariants({ variant, size, radius }), variant && outline && outlineClasses, className)}
      {...props}
    >
      {dot && <span data-icon="inline-start" className={cn(badgeDotVariants({ variant: finalDotVariant, size }), dotClassName)} aria-hidden="true" />}
      {renderIcon(leftIcon, "inline-start")}
      {children}
      {renderIcon(rightIcon, "inline-end")}
      {removable && (
        <button
          type="button"
          data-icon="inline-end"
          onClick={(e) => {
            e.stopPropagation()
            onRemove?.()
          }}
          className="ml-1 inline-flex shrink-0 items-center rounded-sm hover:bg-black/10"
        >
          <Icon name="close" size={12} aria-hidden decorative />
        </button>
      )}
    </Comp>
  )
}

export { Badge, badgeVariants }
