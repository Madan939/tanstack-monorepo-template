import { type IconName, icons } from "@workspace/ui/components/icons/registry"
import { Icon } from "@workspace/ui/components/shared/icon"
import { cn } from "@workspace/ui/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import * as React from "react"

import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip"

export type ButtonVariant =
  | "default"
  | "outline"
  | "secondary"
  | "ghost"
  | "destructive"
  | "link"
  | "info"
  | "success"
  | "warning"
  | "neutral"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 cursor-pointer items-center justify-center rounded-md border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs",
        outline:
          "border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-xs",
        link: "text-primary underline-offset-4 hover:underline",
        // International Standard — Semantic
        info: "bg-info text-info-foreground hover:bg-info/90 shadow-xs", // blue — info, help
        success: "bg-success text-success-foreground hover:bg-success/90 shadow-xs", // green — success, confirm
        warning: "bg-warning text-warning-foreground hover:bg-warning/90 shadow-xs", // amber — warning, caution
        neutral: "bg-neutral text-neutral-foreground hover:bg-neutral/80", // gray — neutral, cancel, disabled alt
      },
      size: {
        default:
          "h-10 gap-2 px-5 has-data-[icon=inline-start]:pl-4 has-data-[icon=inline-end]:pr-4",
        xs: "h-7 gap-1 px-3 text-xs has-data-[icon=inline-start]:pl-2 has-data-[icon=inline-end]:pr-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1.5 px-4 has-data-[icon=inline-start]:pl-3 has-data-[icon=inline-end]:pr-3",
        lg: "h-11 gap-1.5 px-8 has-data-[icon=inline-start]:pl-5 has-data-[icon=inline-end]:pr-5",
        icon: "size-10",
        "icon-xs": "size-7 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-9",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

function isIconName(value: unknown): value is IconName {
  return typeof value === "string" && value in icons
}

const getIconSize = (size: VariantProps<typeof buttonVariants>["size"]) => {
  const map: Record<string, number> = {
    default: 16,
    xs: 14,
    sm: 14,
    lg: 16,
    xl: 16,
    icon: 16,
    "icon-xs": 14,
    "icon-sm": 14,
    "icon-lg": 16,
  }
  return map[size ?? "default"] ?? 16
}

type ButtonTooltipProps = {
  tooltip?: React.ReactNode
  tooltipSide?: React.ComponentProps<typeof TooltipContent>["side"]
  tooltipAlign?: React.ComponentProps<typeof TooltipContent>["align"]
  tooltipDelayDuration?: number
  tooltipSideOffset?: number
}

type ButtonIconProps = {
  /** Icon at start (RTL-aware) */
  startIcon?: IconName | React.ReactNode
  /** Icon at end (RTL-aware) */
  endIcon?: IconName | React.ReactNode
  iconSize?: number
  isPending?: boolean
  pendingText?: string
}

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  } & ButtonTooltipProps &
  ButtonIconProps

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      tooltip,
      tooltipSide,
      tooltipAlign,
      tooltipDelayDuration,
      tooltipSideOffset,
      startIcon,
      endIcon,
      iconSize,
      isPending,
      pendingText,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot.Root : "button"
    const resolvedIconSize = iconSize ?? getIconSize(size)

    const renderIcon = (
      iconVal: IconName | React.ReactNode | undefined,
      position: "inline-start" | "inline-end",
    ) => {
      if (!iconVal) return null
      const isName = isIconName(iconVal)
      const node = isName ? (
        <Icon name={iconVal} size={resolvedIconSize} aria-hidden decorative />
      ) : (
        iconVal
      )
      return (
        <span
          data-icon={position}
          data-slot="button-icon"
          aria-hidden="true"
          className="inline-flex shrink-0 items-center"
        >
          {node}
        </span>
      )
    }

    const isDisabled = disabled || isPending
    const isIconOnly = !children && !!startIcon && !endIcon

    const content = asChild ? (
      children
    ) : isIconOnly ? (
      renderIcon(startIcon, "inline-start")
    ) : (
      <>
        {startIcon && !isPending && renderIcon(startIcon, "inline-start")}
        {isPending && (
          <span
            data-icon="inline-start"
            data-slot="button-icon"
            aria-hidden="true"
            className="inline-flex shrink-0 items-center"
          >
            <span
              aria-hidden="true"
              className="inline-block animate-spin rounded-full border-2 border-current border-t-transparent"
              style={{ width: resolvedIconSize, height: resolvedIconSize }}
            />
          </span>
        )}
        {isPending && pendingText ? pendingText : children}
        {endIcon && !isPending && renderIcon(endIcon, "inline-end")}
      </>
    )

    // Normalize isPending icon fallback: use loader-like icon; we use svg spin via Icon if available else fallback
    const buttonNode = (
      <Comp
        ref={ref}
        type="button"
        data-slot="button"
        data-variant={variant}
        data-size={
          isIconOnly
            ? size === "default"
              ? "icon"
              : size === "xs"
                ? "icon-xs"
                : size === "sm"
                  ? "icon-sm"
                  : size === "lg"
                    ? "icon-lg"
                    : size
            : size
        }
        data-icon-only={isIconOnly || undefined}
        className={cn(
          buttonVariants({
            variant,
            size: isIconOnly ? (size === "default" ? "icon" : size) : size,
            className,
          }),
        )}
        disabled={isDisabled}
        {...props}
      >
        {content}
      </Comp>
    )

    if (!tooltip) return buttonNode

    // For disabled buttons, wrap in span to allow tooltip trigger
    const trigger = isDisabled ? (
      <span
        data-slot="button-tooltip-wrapper"
        tabIndex={0}
        role="button"
        aria-disabled="true"
        className="inline-flex [&_button]:pointer-events-none"
      >
        {buttonNode}
      </span>
    ) : (
      buttonNode
    )

    return (
      <Tooltip delayDuration={tooltipDelayDuration ?? 300}>
        <TooltipTrigger asChild>{trigger}</TooltipTrigger>
        <TooltipContent side={tooltipSide} align={tooltipAlign} sideOffset={tooltipSideOffset}>
          {tooltip}
        </TooltipContent>
      </Tooltip>
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
