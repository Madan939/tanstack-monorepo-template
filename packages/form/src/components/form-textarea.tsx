import { Textarea } from "@workspace/ui/components/design/textarea"
import * as React from "react"
import type { Control, FieldPath, FieldValues, RegisterOptions } from "react-hook-form"

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./form"

type FormTextareaProps<T extends FieldValues> = {
  name: FieldPath<T>
  control?: Control<T>
  label?: string
  description?: string
  required?: boolean
  placeholder?: string
  rows?: number
  size?: "default" | "lg"
  disabled?: boolean
  rules?: RegisterOptions<T, FieldPath<T>>
} & Omit<React.ComponentProps<typeof Textarea>, "name">

/**
 * Accessible textarea — supports i18n `lang`/`dir` inheritance and WCAG 3.3.2 labeling.
 */
function FormTextarea<T extends FieldValues>({
  name,
  control,
  label,
  description,
  required,
  rules,
  ...props
}: FormTextareaProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      rules={rules}
      render={({ field }) => (
        <FormItem>
          {label ? <FormLabel required={required}>{label}</FormLabel> : null}
          <FormControl>
            <Textarea aria-required={!!required} {...field} {...props} value={field.value ?? ""} />
          </FormControl>
          {description ? <FormDescription>{description}</FormDescription> : null}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export { FormTextarea }
