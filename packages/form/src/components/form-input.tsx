import { Input } from "@workspace/ui/components/design/input"
import * as React from "react"
import type { Control, FieldPath, FieldValues, RegisterOptions } from "react-hook-form"

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./form"

type FormInputProps<T extends FieldValues> = {
  /** Field path — type-safe when `T` is inferred from `useForm<T>()`. */
  name: FieldPath<T>
  /** Optional control; inferred from `<Form>` context when omitted (WAI-ARIA pattern). */
  control?: Control<T>
  label?: string
  description?: string
  /** Alias for `description` — matches `@chatboq-frontend` `hint` prop. */
  hint?: string
  /** Visual required indicator + `aria-required` (WCAG 3.3.2). */
  required?: boolean
  /** @deprecated use `description`/`hint` — retained for `@chatboq-frontend` compat */
  placeholder?: string
  size?: "default" | "lg"
  hintIcon?: string
  hintIconClassName?: string
  inputClassName?: string
  wrapperProps?: React.ComponentProps<"div">
  labelProps?: React.ComponentProps<typeof import("@workspace/ui/components/design/label").Label>
  inputProps?: React.ComponentProps<typeof Input>
  /** Alias for Controller `rules` — matches `registerOption` from chatboq */
  registerOption?: RegisterOptions<T, FieldPath<T>>
  rules?: RegisterOptions<T, FieldPath<T>>
  disabled?: boolean
} & Omit<React.ComponentProps<typeof Input>, "name" | "leftIcon" | "rightIcon"> & {
    leftIcon?: React.ComponentProps<typeof Input>["leftIcon"]
    rightIcon?: React.ComponentProps<typeof Input>["rightIcon"]
  }

/**
 * Accessible text input bound to react-hook-form.
 * @see HTML Standard — `autocomplete` should be set for WCAG 1.3.5 Identify Input Purpose
 * Supports both `@workspace/form` (`description`, `control`) and `@chatboq-frontend` (`hint`, `inputProps`, `wrapperProps`) APIs.
 */
function FormInput<T extends FieldValues>({
  name,
  control,
  label,
  description,
  hint,
  required,
  wrapperProps,
  labelProps,
  inputProps,
  inputClassName,
  registerOption,
  rules,
  size: _size,
  hintIcon: _hintIcon,
  hintIconClassName: _hintIconClassName,
  ...props
}: FormInputProps<T>) {
  const hintText = hint ?? description
  const controllerRules: RegisterOptions<T, FieldPath<T>> | undefined = rules ?? registerOption
  const { className: wrapperClassName, ...restWrapperProps } = wrapperProps ?? {}
  const { className: labelClassName, ...restLabelProps } = (labelProps ?? {}) as {
    className?: string
  } & Record<string, unknown>
  const mergedInputProps: React.ComponentProps<typeof Input> = {
    ...(inputProps ?? {}),
    ...(inputClassName ? { className: [inputClassName, (inputProps as { className?: string })?.className].filter(Boolean).join(" ") } : {}),
  }

  return (
    <FormField
      control={control}
      name={name}
      rules={controllerRules}
      render={({ field }) => (
        <FormItem className={wrapperClassName} {...restWrapperProps}>
          {label ? (
            <FormLabel required={required} className={labelClassName} {...(restLabelProps as object)}>
              {label}
            </FormLabel>
          ) : null}
          <FormControl>
            <Input
              aria-required={!!required}
              autoComplete={props.autoComplete}
              {...field}
              {...props}
              {...mergedInputProps}
              value={field.value ?? ""}
              className={[props.className, mergedInputProps.className].filter(Boolean).join(" ") || undefined}
            />
          </FormControl>
          {hintText ? <FormDescription>{hintText}</FormDescription> : null}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export { FormInput }
