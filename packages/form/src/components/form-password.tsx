import { PasswordInput } from "@workspace/ui/components/design/password-input"
import * as React from "react"
import type { Control, FieldPath, FieldValues, RegisterOptions } from "react-hook-form"

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./form"

type FormPasswordProps<T extends FieldValues> = {
  name: FieldPath<T>
  control?: Control<T>
  label?: string
  description?: string
  placeholder?: string
  size?: "default" | "lg"
  required?: boolean
  disabled?: boolean
  autoComplete?: string
  rules?: RegisterOptions<T, FieldPath<T>>
} & Omit<React.ComponentProps<typeof PasswordInput>, "name">

export function FormPassword<T extends FieldValues>({
  name,
  control,
  label,
  description,
  placeholder,
  size,
  required,
  disabled,
  autoComplete,
  rules,
  ...props
}: FormPasswordProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      rules={rules}
      render={({ field }) => (
        <FormItem>
          {label ? <FormLabel required={required}>{label}</FormLabel> : null}
          <FormControl>
            <PasswordInput
              size={size}
              placeholder={placeholder}
              aria-required={!!required}
              disabled={disabled}
              autoComplete={autoComplete}
              {...field}
              {...props}
              value={field.value ?? ""}
            />
          </FormControl>
          {description ? <FormDescription>{description}</FormDescription> : null}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
