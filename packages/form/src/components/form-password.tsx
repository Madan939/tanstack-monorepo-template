import { Icon } from "@workspace/ui/components/shared/icon"
import { Label } from "@workspace/ui/components/design/label"
import { PasswordInput } from "@workspace/ui/components/design/password-input"
import { Typography } from "@workspace/ui/components/shared/typography"
import { cn } from "@workspace/ui/lib/utils"
import type { IconName } from "@workspace/ui/components/icons/registry"
import {
  get,
  useFormContext,
  type FieldValues,
  type RegisterOptions,
} from "react-hook-form"

type FormPasswordProps = {
  name: string
  label?: string
  hint?: string
  description?: string
  placeholder?: string
  size?: "default" | "lg"
  required?: boolean
  leftHintIcon?: IconName
  registerOption?: RegisterOptions<FieldValues, string>
  rules?: RegisterOptions<FieldValues, string>
  inputProps?: React.ComponentProps<typeof PasswordInput>
  wrapperProps?: React.ComponentProps<"div">
  labelProps?: React.ComponentProps<typeof Label>
  hintIconClassName?: string
  disabled?: boolean
  autoComplete?: string
}

export function FormPassword({
  name,
  label,
  hint,
  description,
  placeholder,
  size,
  required,
  leftHintIcon,
  registerOption,
  rules,
  inputProps,
  wrapperProps,
  labelProps,
  hintIconClassName,
  disabled,
  autoComplete,
}: FormPasswordProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext()
  const error = get(errors, name)
  const hintText = hint ?? description
  const controllerRules = rules ?? registerOption
  const { className: wrapperClassName, ...restWrapperProps } = wrapperProps ?? {}
  const { className: labelClassName, ...restLabelProps } = (labelProps ?? {}) as { className?: string } & Record<string, unknown>

  return (
    <div className={cn("flex flex-col gap-1.5", wrapperClassName)} {...restWrapperProps}>
      {(label || required) && (
        <div className="flex flex-row gap-1.5">
          {label ? (
            <Label htmlFor={name} {...(restLabelProps as object)} className={cn(labelClassName)}>
              {label}
            </Label>
          ) : null}
          {required ? <span aria-hidden className="text-destructive">*</span> : null}
        </div>
      )}

      <PasswordInput
        size={size}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-required={!!required}
        id={name}
        disabled={disabled}
        autoComplete={autoComplete}
        {...register(name, controllerRules)}
        {...inputProps}
      />

      {hintText && !error ? (
        <div className="flex gap-1.5">
          <Icon
            name={leftHintIcon ?? "info"}
            size={14}
            className={cn("text-muted-foreground", hintIconClassName)}
            aria-hidden
            decorative
          />
          <Typography variant="muted" className="text-xs text-muted-foreground">
            {hintText}
          </Typography>
        </div>
      ) : null}
      {error ? (
        <div className="flex items-center gap-1.5">
          <Icon name="info" size={14} className="text-destructive" aria-hidden decorative />
          <Typography variant="muted" className="text-xs text-destructive">
            {(error.message as string) ?? "Invalid value"}
          </Typography>
        </div>
      ) : null}
    </div>
  )
}
