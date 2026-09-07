import { Label } from "@workspace/ui/components/design/label"
import { RadioGroup, RadioGroupItem } from "@workspace/ui/components/design/radio-group"
import * as React from "react"
import type { Control, FieldPath, FieldValues } from "react-hook-form"

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./form"

type Option = {
  value: string
  label: string
  disabled?: boolean
}

type FormRadioGroupProps<T extends FieldValues> = {
  name: FieldPath<T>
  control?: Control<T>
  label?: string
  description?: string
  required?: boolean
  options: Option[]
} & Omit<React.ComponentProps<typeof RadioGroup>, "value" | "onValueChange" | "name">

/**
 * Radio group — WAI-ARIA radiogroup pattern, roving tabindex handled by Radix.
 * Renders `fieldset`-like semantics via `role="radiogroup"` + `aria-required`.
 */
function FormRadioGroup<T extends FieldValues>({
  name,
  control,
  label,
  description,
  required,
  options,
  ...props
}: FormRadioGroupProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label ? <FormLabel required={required}>{label}</FormLabel> : null}
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              value={field.value ?? ""}
              aria-required={!!required}
              {...props}
            >
              {options.map((option) => (
                <div key={option.value} className="flex items-center gap-2">
                  <RadioGroupItem value={option.value} disabled={option.disabled} />
                  <Label className="font-normal normal-case tracking-normal">{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </FormControl>
          {description ? <FormDescription>{description}</FormDescription> : null}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export { FormRadioGroup }
