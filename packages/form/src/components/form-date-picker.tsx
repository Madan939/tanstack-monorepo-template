import { Button } from "@workspace/ui/components/design/button"
import { Calendar } from "@workspace/ui/components/design/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/design/popover"
import { Icon } from "@workspace/ui/components/shared/icon"
import { cn } from "@workspace/ui/lib/utils"
import type { Control, FieldPath, FieldValues, RegisterOptions } from "react-hook-form"

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./form"

type FormDatePickerProps<T extends FieldValues> = {
  name: FieldPath<T>
  control?: Control<T>
  label?: string
  description?: string
  required?: boolean
  placeholder?: string
  disabled?: boolean
  rules?: RegisterOptions<T, FieldPath<T>>
  formatDate?: (date: Date) => string
}

function FormDatePicker<T extends FieldValues>({
  name,
  control,
  label,
  description,
  required,
  placeholder = "Pick a date",
  disabled,
  rules,
  formatDate,
}: FormDatePickerProps<T>) {
  const defaultFormat = (date: Date) =>
    date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })

  const formatter = formatDate ?? defaultFormat

  return (
    <FormField
      control={control}
      name={name}
      rules={rules}
      render={({ field }) => {
        const selectedDate = field.value ? new Date(field.value) : undefined

        return (
          <FormItem className="flex flex-col gap-2">
            {label ? <FormLabel required={required}>{label}</FormLabel> : null}
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    disabled={disabled}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !field.value && "text-muted-foreground",
                    )}
                    startIcon={<Icon name="calendar-icon" size={16} aria-hidden decorative />}
                  >
                    {selectedDate && !Number.isNaN(selectedDate.getTime())
                      ? formatter(selectedDate)
                      : placeholder}
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    field.onChange(date ? date.toISOString() : null)
                  }}
                  disabled={disabled}
                />
              </PopoverContent>
            </Popover>
            {description ? <FormDescription>{description}</FormDescription> : null}
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}

export { FormDatePicker }
