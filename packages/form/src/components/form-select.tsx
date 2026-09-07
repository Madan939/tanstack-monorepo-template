import { ReactSelect, type ReactSelectOption } from "@workspace/ui/components/shared/react-select"
import type { Control, FieldPath, FieldValues } from "react-hook-form"

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./form"

type FormSelectProps<T extends FieldValues> = {
  name: FieldPath<T>
  control?: Control<T>
  label?: string
  description?: string
  hint?: string
  required?: boolean
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  searchable?: boolean
  clearable?: boolean
  disabled?: boolean
  className?: string
  options?: ReactSelectOption[]
  /** Async loader — when provided, Select calls API on search. */
  loadOptions?: (inputValue: string) => Promise<ReactSelectOption[]>
  /** Shorthand for API fetching: `GET ${apiUrl}?q=${inputValue}` */
  apiUrl?: string
  isLoading?: boolean
  cacheOptions?: boolean
  defaultOptions?: boolean | ReactSelectOption[]
}

function FormSelect<T extends FieldValues>({
  name,
  control,
  label,
  description,
  hint,
  required,
  placeholder,
  searchPlaceholder,
  emptyText,
  searchable,
  clearable,
  disabled,
  className,
  options = [],
  loadOptions,
  apiUrl,
  isLoading,
  cacheOptions,
  defaultOptions,
}: FormSelectProps<T>) {
  const hintText = hint ?? description
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label ? <FormLabel required={required}>{label}</FormLabel> : null}
          <FormControl>
            <ReactSelect
              value={field.value ?? ""}
              onValueChange={field.onChange}
              options={options}
              loadOptions={loadOptions}
              apiUrl={apiUrl}
              placeholder={placeholder}
              searchPlaceholder={searchPlaceholder}
              emptyText={emptyText}
              searchable={searchable}
              clearable={clearable}
              disabled={disabled}
              isLoading={isLoading}
              cacheOptions={cacheOptions}
              defaultOptions={defaultOptions}
            />
          </FormControl>
          {hintText ? <FormDescription>{hintText}</FormDescription> : null}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export { FormSelect }
