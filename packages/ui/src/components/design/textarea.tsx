import { type IconName, icons } from "@workspace/ui/components/icons/registry"
import { Icon } from "@workspace/ui/components/shared/icon"
import { cn } from "@workspace/ui/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

const textareaVariants = cva(
  [
    "flex w-full min-w-0 gap-2 rounded-md border border-input bg-background text-muted-foreground",
    "transition-[color,box-shadow]",
    "focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20",
    "data-[disabled=true]:pointer-events-none data-[disabled=true]:border-input data-[disabled=true]:bg-muted data-[disabled=true]:text-muted-foreground",
    "data-[invalid=true]:border-destructive focus-within:data-[invalid=true]:ring-2 data-[invalid=true]:focus-within:ring-destructive/20",
  ],
  {
    variants: {
      size: {
        default: "px-3 py-2 min-h-24",
        lg: "px-3.5 py-3 min-h-32",
      },
    },
    defaultVariants: { size: "default" },
  },
)

const textareaElementVariants = cva(
  [
    "w-full flex-1 resize-none border-0 bg-transparent font-medium shadow-none outline-none",
    "text-foreground placeholder:font-normal placeholder:text-muted-foreground",
    "disabled:pointer-events-none disabled:placeholder:text-muted-foreground/50",
  ],
  {
    variants: {
      size: {
        default: "text-sm",
        lg: "text-base",
      },
    },
    defaultVariants: { size: "default" },
  },
)

const getIconSize = (size: VariantProps<typeof textareaVariants>["size"]) => {
  const map: Record<string, number> = { default: 16, lg: 18 }
  return map[size ?? "default"] ?? 16
}

function isIconName(value: unknown): value is IconName {
  return typeof value === "string" && value in icons
}

export interface TextareaProps
  extends Omit<React.ComponentProps<"textarea">, "size">,
    VariantProps<typeof textareaVariants> {
  /** Icon at start (RTL-aware) */
  startIcon?: React.ReactNode | IconName
}

function Textarea({ className, size, startIcon, ...props }: TextareaProps) {
  const iconSize = getIconSize(size)
  const isDisabled = props.disabled
  const isInvalid = props["aria-invalid"] === true || props["aria-invalid"] === "true"

  if (!startIcon) {
    return (
      <textarea
        data-slot="textarea"
        data-disabled={isDisabled ? "true" : undefined}
        data-invalid={isInvalid ? "true" : undefined}
        className={cn(
          textareaVariants({ size }),
          textareaElementVariants({ size }),
          "field-sizing-content",
          className,
        )}
        {...props}
      />
    )
  }

  return (
    <div
      data-disabled={isDisabled ? "true" : undefined}
      data-invalid={isInvalid ? "true" : undefined}
      className={cn(textareaVariants({ size }), className)}
    >
      <div className="mt-0.5 shrink-0">
        {isIconName(startIcon) ? (
          <Icon
            name={startIcon}
            size={iconSize}
            aria-hidden
            decorative
            className="text-muted-foreground"
          />
        ) : (
          startIcon
        )}
      </div>
      <textarea data-slot="textarea" className={cn(textareaElementVariants({ size }))} {...props} />
    </div>
  )
}

export { Textarea, textareaVariants }
