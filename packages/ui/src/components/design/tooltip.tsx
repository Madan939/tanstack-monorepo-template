import { cn } from "@workspace/ui/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import { Tooltip as TooltipPrimitive } from "radix-ui"
import * as React from "react"

const tooltipContentVariants = cva(
  [
    "z-50 inline-flex w-fit max-w-xs origin-(--radix-tooltip-content-transform-origin) items-center gap-1.5 rounded-md has-data-[slot=kbd]:pr-1.5",
    "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
    "**:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-sm",
    "data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95",
    "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
  ],
  {
    variants: {
      variant: {
        default: "bg-foreground text-background",
        light: "bg-popover text-popover-foreground shadow-md ring-1 ring-border",
      },
      size: {
        default: "px-2.5 py-1.5 text-xs",
        lg: "px-3 py-2.5 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

const tooltipPrimaryTextVariants = cva(["text-xs font-medium"], {
  variants: {
    variant: {
      default: "text-background",
      light: "text-foreground",
    },
  },
  defaultVariants: { variant: "default" },
})

const tooltipSecondaryTextVariants = cva(["text-[11px] font-normal"], {
  variants: {
    variant: {
      default: "text-background/70",
      light: "text-muted-foreground",
    },
  },
  defaultVariants: { variant: "default" },
})

const tooltipArrowVariants = cva("z-50 size-2.5 translate-y-[calc(-50%-2px)] rotate-45", {
  variants: {
    variant: {
      default: "bg-foreground fill-foreground",
      light: "bg-popover fill-popover",
    },
  },
  defaultVariants: { variant: "default" },
})

export type TooltipPlacement =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "left-top"
  | "left-bottom"
  | "right-top"
  | "right-bottom"

type Side = "top" | "bottom" | "left" | "right"
type Align = "start" | "center" | "end"

const PLACEMENT_MAP: Record<TooltipPlacement, { side: Side; align: Align }> = {
  top: { side: "top", align: "center" },
  bottom: { side: "bottom", align: "center" },
  left: { side: "left", align: "center" },
  right: { side: "right", align: "center" },
  "top-left": { side: "top", align: "start" },
  "top-right": { side: "top", align: "end" },
  "bottom-left": { side: "bottom", align: "start" },
  "bottom-right": { side: "bottom", align: "end" },
  "left-top": { side: "left", align: "start" },
  "left-bottom": { side: "left", align: "end" },
  "right-top": { side: "right", align: "start" },
  "right-bottom": { side: "right", align: "end" },
}

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  )
}

function Tooltip({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

function TooltipTrigger({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

type TooltipContentProps = React.ComponentProps<typeof TooltipPrimitive.Content> &
  VariantProps<typeof tooltipContentVariants> & {
    showTipArrow?: boolean
    placement?: TooltipPlacement
    tooltipPrimaryText?: string | undefined
    tooltipSecondaryText?: string | undefined
  }

function TooltipContent({
  className,
  sideOffset = 4,
  alignOffset = -10,
  children,
  variant,
  size,
  showTipArrow = true,
  placement,
  side,
  align,
  tooltipSecondaryText,
  tooltipPrimaryText,
  ...props
}: TooltipContentProps) {
  const resolvedProps = placement
    ? PLACEMENT_MAP[placement]
    : {
        ...(side !== undefined && { side }),
        ...(align !== undefined && { align }),
      }

  const content =
    tooltipSecondaryText || tooltipPrimaryText ? (
      <div className="space-y-0.5 text-start">
        {tooltipSecondaryText && (
          <p className={cn(tooltipSecondaryTextVariants({ variant }))}>{tooltipSecondaryText}</p>
        )}
        {tooltipPrimaryText && (
          <p className={cn(tooltipPrimaryTextVariants({ variant }))}>{tooltipPrimaryText}</p>
        )}
      </div>
    ) : (
      children
    )

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        avoidCollisions
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        {...resolvedProps}
        className={cn(tooltipContentVariants({ variant, size }), className)}
        {...props}
      >
        {content}
        {showTipArrow && <TooltipPrimitive.Arrow className={tooltipArrowVariants({ variant })} />}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
export type { TooltipContentProps }
