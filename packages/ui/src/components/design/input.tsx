import { type IconName, icons } from "@workspace/ui/components/icons/registry"
import { Icon } from "@workspace/ui/components/shared/icon"
import { cn } from "@workspace/ui/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

const inputVariants = cva(
  [
    "flex w-full min-w-0 items-center justify-between gap-2 rounded-md border border-input bg-background text-muted-foreground",
    "transition-[color,box-shadow]",
    "focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20",
  ],
  {
    variants: {
      size: {
        default: "h-10 px-3",
        lg: "h-11 px-3.5",
      },
    },
    defaultVariants: { size: "default" },
  },
)

const inputElementVariants = cva(
  [
    "flex-1 border-0 bg-transparent font-medium shadow-none outline-none",
    "text-foreground placeholder:font-normal placeholder:text-muted-foreground",
    "disabled:pointer-events-none disabled:placeholder:text-muted-foreground/50",
    "file:inline-flex file:border-0 file:bg-transparent file:text-sm file:font-medium data-[disabled=true]:text-muted-foreground",
    "group-data-[disabled=true]:text-muted-foreground group-data-[disabled=true]:placeholder:text-muted-foreground/50",
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

const getIconSize = (size: VariantProps<typeof inputVariants>["size"]) => {
  const map: Record<string, number> = { default: 16, lg: 18 }
  return map[size ?? "default"] ?? 16
}

function isIconName(value: unknown): value is IconName {
  return typeof value === "string" && value in icons
}

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {
  leftIcon?: React.ReactNode | IconName
  rightIcon?: React.ReactNode | IconName
  iconSize?: number
}

function Input({ className, type, size, leftIcon, rightIcon, iconSize, ...props }: InputProps) {
  const resolvedIconSize = iconSize ?? getIconSize(size)
  const isDisabled = props.disabled
  const isInvalid = props["aria-invalid"] === true || props["aria-invalid"] === "true"

  return (
    <div
      data-disabled={isDisabled ? "true" : undefined}
      data-invalid={isInvalid ? "true" : undefined}
      className={cn(
        "group",
        inputVariants({ size }),
        "data-[disabled=true]:pointer-events-none data-[disabled=true]:border-input data-[disabled=true]:bg-muted data-[disabled=true]:text-muted-foreground",
        "data-[invalid=true]:border-destructive focus-within:data-[invalid=true]:border-destructive focus-within:data-[invalid=true]:ring-2 data-[invalid=true]:focus-within:ring-destructive/20",
        className,
      )}
    >
      {leftIcon &&
        (isIconName(leftIcon) ? (
          <Icon name={leftIcon} size={resolvedIconSize} aria-hidden decorative className="shrink-0 text-muted-foreground" />
        ) : (
          <span className="inline-flex shrink-0 items-center text-muted-foreground">{leftIcon}</span>
        ))}

      <input type={type} data-slot="input" className={cn(inputElementVariants({ size }))} {...props} />

      {rightIcon &&
        (isIconName(rightIcon) ? (
          <Icon name={rightIcon} size={resolvedIconSize} aria-hidden decorative className="shrink-0 text-muted-foreground" />
        ) : (
          <span className="inline-flex shrink-0 items-center text-muted-foreground">{rightIcon}</span>
        ))}
    </div>
  )
}

export { Input, inputVariants, inputElementVariants }
