import { Input } from "@workspace/ui/components/design/input"
import * as React from "react"
import type { Control, FieldPath, FieldValues, RegisterOptions } from "react-hook-form"

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./form"

type FormInputProps<T extends FieldValues> = {
  /** Field path — type-safe when `T` is inferred from `useForm<T>()`. */
  name: FieldPath<T>
  /** Optional control; inferred from `<Form>` context when omitted. */
  control?: Control<T>
  label?: string
  description?: string
  /** Visual required indicator + `aria-required` (WCAG 3.3.2). */
  required?: boolean
  placeholder?: string
  size?: "default" | "lg"
  disabled?: boolean
  rules?: RegisterOptions<T, FieldPath<T>>
} & Omit<React.ComponentProps<typeof Input>, "name">

/**
 * Accessible text input bound to react-hook-form.
 * @see HTML Standard — `autocomplete` should be set for WCAG 1.3.5 Identify Input Purpose
 */
function FormInput<T extends FieldValues>({
  name,
  control,
  label,
  description,
  required,
  rules,
  ...props
}: FormInputProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      rules={rules}
      render={({ field }) => (
        <FormItem>
          {label ? <FormLabel required={required}>{label}</FormLabel> : null}
          <FormControl>
            <Input aria-required={!!required} {...field} {...props} value={field.value ?? ""} />
          </FormControl>
          {description ? <FormDescription>{description}</FormDescription> : null}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export { FormInput }
