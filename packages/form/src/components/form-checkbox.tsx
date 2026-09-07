import { Checkbox } from "@workspace/ui/components/design/checkbox"
import * as React from "react"
import type { Control, FieldPath, FieldValues, RegisterOptions } from "react-hook-form"

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./form"

type FormCheckboxProps<T extends FieldValues> = {
  name: FieldPath<T>
  control?: Control<T>
  label?: string
  description?: string
  required?: boolean
  rules?: RegisterOptions<T, FieldPath<T>>
} & Omit<React.ComponentProps<typeof Checkbox>, "checked" | "onCheckedChange" | "name">

/**
 * Tri-state capable checkbox (checked / unchecked / indeterminate) — WAI-ARIA checkbox pattern.
 * Maps `field.value` ↔ `checked` and `field.onChange` ↔ `onCheckedChange`.
 */
function FormCheckbox<T extends FieldValues>({
  name,
  control,
  label,
  description,
  required,
  rules,
  ...props
}: FormCheckboxProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      rules={rules}
      render={({ field }) => (
        <FormItem className="flex flex-row items-start gap-3 space-y-0">
          <FormControl>
            <Checkbox
              checked={!!field.value}
              onCheckedChange={field.onChange}
              aria-required={!!required}
              {...props}
            />
          </FormControl>
          <div className="grid gap-1 leading-none">
            {label ? <FormLabel required={required}>{label}</FormLabel> : null}
            {description ? <FormDescription>{description}</FormDescription> : null}
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  )
}

export { FormCheckbox }
