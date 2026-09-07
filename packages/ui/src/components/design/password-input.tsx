import { Icon } from "@workspace/ui/components/shared/icon"
import { cn } from "@workspace/ui/lib/utils"
import * as React from "react"

import { Input, type InputProps } from "./input"

export interface PasswordInputProps extends Omit<InputProps, "type" | "endIcon"> {}

function PasswordInput({ disabled, size, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = React.useState(false)

  const togglePasswordVisibility = () => {
    if (disabled) return
    setShowPassword((prev) => !prev)
  }

  const iconSize = size === "lg" ? 18 : 16

  return (
    <Input
      {...props}
      size={size}
      disabled={disabled}
      type={showPassword ? "text" : "password"}
      endIcon={
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={togglePasswordVisibility}
          className={cn(
            "flex cursor-pointer items-center justify-center text-muted-foreground outline-none",
            "hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50",
          )}
          aria-label={showPassword ? "Hide password" : "Show password"}
          aria-pressed={showPassword}
        >
          <Icon name={showPassword ? "eye-on" : "eye-off"} size={iconSize} aria-hidden decorative />
        </button>
      }
    />
  )
}

PasswordInput.displayName = "PasswordInput"

export { PasswordInput }
