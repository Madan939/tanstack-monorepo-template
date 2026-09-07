import { type Country, PhoneInput } from "@workspace/ui/components/design/phone-input"
import * as React from "react"
import type { Control, FieldPath, FieldValues, RegisterOptions } from "react-hook-form"

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./form"

export type FormPhoneInputProps<T extends FieldValues> = {
  name: FieldPath<T>
  control?: Control<T>
  label?: string
  description?: string
  placeholder?: string
  size?: "default" | "lg"
  required?: boolean
  disabled?: boolean
  defaultCountry?: string
  onCountryChange?: (country: Country) => void
  rules?: RegisterOptions<T, FieldPath<T>>
} & Omit<React.ComponentProps<typeof PhoneInput>, "name">

export function FormPhoneInput<T extends FieldValues>({
  name,
  control,
  label,
  description,
  placeholder,
  size,
  required,
  disabled,
  defaultCountry,
  onCountryChange,
  rules,
  ...props
}: FormPhoneInputProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      rules={rules}
      render={({ field }) => (
        <FormItem>
          {label ? <FormLabel required={required}>{label}</FormLabel> : null}
          <FormControl>
            <PhoneInput
              size={size}
              placeholder={placeholder}
              aria-required={!!required}
              disabled={disabled}
              defaultCountry={defaultCountry}
              onCountryChange={onCountryChange}
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
