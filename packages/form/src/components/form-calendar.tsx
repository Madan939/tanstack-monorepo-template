import { Calendar } from "@workspace/ui/components/design/calendar"
import * as React from "react"
import type { Control, FieldPath, FieldValues } from "react-hook-form"

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./form"

type FormCalendarProps<T extends FieldValues> = {
  name: FieldPath<T>
  control?: Control<T>
  label?: string
  description?: string
  required?: boolean
} & Omit<React.ComponentProps<typeof Calendar>, "selected" | "onSelect" | "mode" | "name">

/**
 * Date picker bound to `Date | undefined` — inherits locale/dir for i18n
 * and exposes `aria-required`.
 */
function FormCalendar<T extends FieldValues>({
  name,
  control,
  label,
  description,
  required,
  ...props
}: FormCalendarProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label ? <FormLabel required={required}>{label}</FormLabel> : null}
          <FormControl>
            <Calendar mode="single" selected={field.value} onSelect={field.onChange} {...props} />
          </FormControl>
          {description ? <FormDescription>{description}</FormDescription> : null}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export { FormCalendar }
