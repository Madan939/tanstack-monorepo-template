import {
  ReactMultiSelect,
  type ReactMultiSelectOption,
} from "@workspace/ui/components/shared/react-multi-select"
import type { Control, FieldPath, FieldValues } from "react-hook-form"

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./form"

type FormMultiSelectProps<T extends FieldValues> = {
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
  disabled?: boolean
  className?: string
  maxCount?: number
  options?: ReactMultiSelectOption[]
  loadOptions?: (inputValue: string) => Promise<ReactMultiSelectOption[]>
  apiUrl?: string
  isLoading?: boolean
  cacheOptions?: boolean
  defaultOptions?: boolean | ReactMultiSelectOption[]
}

function FormMultiSelect<T extends FieldValues>({
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
  disabled,
  className,
  maxCount,
  options = [],
  loadOptions,
  apiUrl,
  isLoading,
  cacheOptions,
  defaultOptions,
}: FormMultiSelectProps<T>) {
  const hintText = hint ?? description
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label ? <FormLabel required={required}>{label}</FormLabel> : null}
          <FormControl>
            <ReactMultiSelect
              value={field.value ?? []}
              onValueChange={field.onChange}
              options={options}
              loadOptions={loadOptions}
              apiUrl={apiUrl}
              placeholder={placeholder}
              searchPlaceholder={searchPlaceholder}
              emptyText={emptyText}
              searchable={searchable}
              disabled={disabled}
              maxCount={maxCount}
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

export { FormMultiSelect }
