import { Switch } from "@workspace/ui/components/design/switch"
import * as React from "react"
import type { Control, FieldPath, FieldValues } from "react-hook-form"

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./form"

type FormSwitchProps<T extends FieldValues> = {
  name: FieldPath<T>
  control?: Control<T>
  label?: string
  description?: string
  required?: boolean
} & Omit<React.ComponentProps<typeof Switch>, "checked" | "onCheckedChange" | "name">

/**
 * Toggle switch — WAI-ARIA switch pattern (`aria-checked`, keyboard Space/Enter).
 */
function FormSwitch<T extends FieldValues>({
  name,
  control,
  label,
  description,
  required,
  ...props
}: FormSwitchProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-none border border-b-input px-0 py-3 has-[[data-slot=switch]]:gap-3">
          <div className="grid gap-1">
            {label ? <FormLabel required={required}>{label}</FormLabel> : null}
            {description ? <FormDescription>{description}</FormDescription> : null}
          </div>
          <FormControl>
            <Switch
              checked={!!field.value}
              onCheckedChange={field.onChange}
              aria-required={!!required}
              {...props}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export { FormSwitch }
