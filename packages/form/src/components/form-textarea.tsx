import { Textarea } from "@workspace/ui/components/design/textarea"
import * as React from "react"
import type { Control, FieldPath, FieldValues, RegisterOptions } from "react-hook-form"

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./form"

type FormTextareaProps<T extends FieldValues> = {
  name: FieldPath<T>
  control?: Control<T>
  label?: string
  description?: string
  hint?: string
  required?: boolean
  placeholder?: string
  leftIcon?: string | React.ReactNode
  rows?: number
  size?: "default" | "lg"
  wrapperProps?: React.ComponentProps<"div">
  labelProps?: React.ComponentProps<typeof import("@workspace/ui/components/design/label").Label>
  textareaProps?: React.ComponentProps<typeof Textarea>
  registerOption?: RegisterOptions<T, FieldPath<T>>
  rules?: RegisterOptions<T, FieldPath<T>>
} & Omit<React.ComponentProps<typeof Textarea>, "name">

/**
 * Accessible textarea — supports i18n `lang`/`dir` inheritance and WCAG 3.3.2 labeling.
 * Supports both `@workspace/form` and `@chatboq-frontend` (`hint`, `textareaProps`, `wrapperProps`) APIs.
 */
function FormTextarea<T extends FieldValues>({
  name,
  control,
  label,
  description,
  hint,
  required,
  wrapperProps,
  labelProps,
  textareaProps,
  registerOption,
  rules,
  leftIcon: _leftIcon,
  size: _size,
  ...props
}: FormTextareaProps<T>) {
  const hintText = hint ?? description
  const controllerRules: RegisterOptions<T, FieldPath<T>> | undefined = rules ?? registerOption
  const { className: wrapperClassName, ...restWrapperProps } = wrapperProps ?? {}
  const { className: labelClassName, ...restLabelProps } = (labelProps ?? {}) as {
    className?: string
  } & Record<string, unknown>
  const mergedTextareaProps = textareaProps ?? {}

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
            <Textarea
              aria-required={!!required}
              {...field}
              {...props}
              {...mergedTextareaProps}
              value={field.value ?? ""}
              className={[props.className, (mergedTextareaProps as { className?: string }).className].filter(Boolean).join(" ") || undefined}
            />
          </FormControl>
          {hintText ? <FormDescription>{hintText}</FormDescription> : null}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export { FormTextarea }
