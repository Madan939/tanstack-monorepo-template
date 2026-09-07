import { cn } from "@workspace/ui/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import { Progress as ProgressPrimitive } from "radix-ui"
import * as React from "react"

const progressIndicatorVariants = cva("size-full flex-1 transition-all", {
  variants: {
    variant: {
      default: "bg-primary", // primary — main progress
      secondary: "bg-secondary",
      destructive: "bg-destructive", // red — error, failed
      info: "bg-info", // blue — informational, loading
      success: "bg-success", // green — success, completed
      warning: "bg-warning", // amber — warning, pending
      neutral: "bg-neutral", // gray — neutral, inactive
    },
  },
  defaultVariants: { variant: "default" },
})

function Progress({
  className,
  value,
  variant = "default",
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> &
  VariantProps<typeof progressIndicatorVariants>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      data-variant={variant}
      className={cn(
        "relative flex h-0.5 w-full items-center overflow-x-hidden rounded-none bg-muted",
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        data-variant={variant}
        className={cn(progressIndicatorVariants({ variant }))}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress, progressIndicatorVariants }
