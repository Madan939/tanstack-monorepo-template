import { Slider } from "@workspace/ui/components/design/slider"
import * as React from "react"
import type { Control, FieldPath, FieldValues } from "react-hook-form"

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./form"

type FormSliderProps<T extends FieldValues> = {
  name: FieldPath<T>
  control?: Control<T>
  label?: string
  description?: string
  required?: boolean
} & Omit<React.ComponentProps<typeof Slider>, "value" | "onValueChange" | "defaultValue" | "name">

/**
 * Single-value slider — WAI-ARIA slider pattern (`aria-valuenow/min/max` provided by Radix).
 * Maps numeric `field.value` ↔ `[number]` expected by Radix Slider.
 */
function FormSlider<T extends FieldValues>({
  name,
  control,
  label,
  description,
  required,
  ...props
}: FormSliderProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label ? <FormLabel required={required}>{label}</FormLabel> : null}
          <FormControl>
            <Slider
              value={field.value != null ? [field.value as number] : undefined}
              onValueChange={(vals) => field.onChange(vals[0])}
              aria-required={!!required}
              {...props}
            />
          </FormControl>
          {description ? <FormDescription>{description}</FormDescription> : null}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

/**
 * Range slider (`[min, max]`) — form value is `number[]`.
 */
function FormRangeSlider<T extends FieldValues>({
  name,
  control,
  label,
  description,
  required,
  ...props
}: {
  name: FieldPath<T>
  control?: Control<T>
  label?: string
  description?: string
  required?: boolean
} & Omit<React.ComponentProps<typeof Slider>, "value" | "onValueChange" | "name">) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label ? <FormLabel required={required}>{label}</FormLabel> : null}
          <FormControl>
            <Slider
              value={field.value}
              onValueChange={field.onChange}
              aria-required={!!required}
              {...props}
            />
          </FormControl>
          {description ? <FormDescription>{description}</FormDescription> : null}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export { FormRangeSlider, FormSlider }
