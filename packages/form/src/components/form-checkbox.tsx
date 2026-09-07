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
  wrapperProps?: React.ComponentProps<"div">
  labelProps?: React.ComponentProps<typeof import("@workspace/ui/components/design/label").Label>
  checkboxProps?: React.ComponentProps<typeof Checkbox>
  registerOption?: RegisterOptions<T, FieldPath<T>>
  rules?: RegisterOptions<T, FieldPath<T>>
} & Omit<React.ComponentProps<typeof Checkbox>, "checked" | "onCheckedChange" | "name">

/**
 * Tri-state capable checkbox (checked / unchecked / indeterminate) — WAI-ARIA checkbox pattern.
 * Maps `field.value` ↔ `checked` and `field.onChange` ↔ `onCheckedChange`.
 * Supports `wrapperProps`/`labelProps`/`checkboxProps` for `@chatboq-frontend` compat.
 */
function FormCheckbox<T extends FieldValues>({
  name,
  control,
  label,
  description,
  required,
  wrapperProps,
  labelProps,
  checkboxProps,
  registerOption,
  rules,
  ...props
}: FormCheckboxProps<T>) {
  const controllerRules: RegisterOptions<T, FieldPath<T>> | undefined = rules ?? registerOption
  const { className: wrapperClassName, ...restWrapperProps } = wrapperProps ?? {}
  const { className: labelClassName, ...restLabelProps } = (labelProps ?? {}) as {
    className?: string
  } & Record<string, unknown>
  const mergedCheckboxProps = {
    ...props,
    ...(checkboxProps ?? {}),
  } as React.ComponentProps<typeof Checkbox>

  return (
    <FormField
      control={control}
      name={name}
      rules={controllerRules}
      render={({ field }) => (
        <FormItem
          className={["flex flex-row items-start gap-3 space-y-0", wrapperClassName].filter(Boolean).join(" ")}
          {...restWrapperProps}
        >
          <FormControl>
            <Checkbox
              checked={!!field.value}
              onCheckedChange={field.onChange}
              aria-required={!!required}
              {...mergedCheckboxProps}
            />
          </FormControl>
          <div className="grid gap-1 leading-none">
            {label ? (
              <FormLabel
                required={required}
                className={["font-normal normal-case tracking-normal", labelClassName].filter(Boolean).join(" ")}
                {...(restLabelProps as object)}
              >
                {label}
              </FormLabel>
            ) : null}
            {description ? <FormDescription>{description}</FormDescription> : null}
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  )
}

export { FormCheckbox }
