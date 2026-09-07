import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@workspace/ui/components/design/input-otp"
import * as React from "react"
import type { Control, FieldPath, FieldValues } from "react-hook-form"

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./form"

type FormInputOTPProps<T extends FieldValues> = {
  name: FieldPath<T>
  control?: Control<T>
  label?: string
  description?: string
  required?: boolean
  maxLength?: number
} & Omit<React.ComponentProps<typeof InputOTP>, "value" | "onChange" | "children" | "name">

/**
 * One-time-password input — each slot is focusable; pasted codes are distributed
 * automatically by `input-otp`. `aria-required` + live error region provided.
 */
function FormInputOTP<T extends FieldValues>({
  name,
  control,
  label,
  description,
  required,
  maxLength = 6,
  ...props
}: FormInputOTPProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label ? <FormLabel required={required}>{label}</FormLabel> : null}
          <FormControl>
            <InputOTP
              maxLength={maxLength}
              value={field.value ?? ""}
              onChange={field.onChange}
              aria-required={!!required}
              {...(props as object)}
            >
              <InputOTPGroup>
                {Array.from({ length: maxLength }, (_, i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </FormControl>
          {description ? <FormDescription>{description}</FormDescription> : null}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export { FormInputOTP }
