import { cn } from "@workspace/ui/lib/utils"
import * as React from "react"
import type { Control, FieldPath, FieldValues, RegisterOptions } from "react-hook-form"

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./form"

export type SelectOption = {
  label: string
  value: string
  disabled?: boolean
}

type FormNativeSelectProps<T extends FieldValues> = {
  name: FieldPath<T>
  control?: Control<T>
  label?: string
  description?: string
  required?: boolean
  placeholder?: string
  options: SelectOption[]
  rules?: RegisterOptions<T, FieldPath<T>>
} & Omit<React.ComponentProps<"select">, "name" | "options">

function FormNativeSelect<T extends FieldValues>({
  name,
  control,
  label,
  description,
  required,
  placeholder,
  options,
  rules,
  className,
  disabled,
  ...props
}: FormNativeSelectProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      rules={rules}
      render={({ field }) => (
        <FormItem>
          {label ? <FormLabel required={required}>{label}</FormLabel> : null}
          <FormControl>
            <div className="relative">
              <select
                aria-required={!!required}
                disabled={disabled}
                className={cn(
                  "border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/20 flex h-10 w-full appearance-none rounded-md border px-3 py-2 text-sm transition-colors outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
                  className,
                )}
                {...field}
                {...props}
                value={field.value ?? ""}
              >
                {placeholder ? (
                  <option value="" disabled hidden>
                    {placeholder}
                  </option>
                ) : null}
                {options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </FormControl>
          {description ? <FormDescription>{description}</FormDescription> : null}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export { FormNativeSelect }
