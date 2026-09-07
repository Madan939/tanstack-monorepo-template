import { cn } from "@workspace/ui/lib/utils"
import * as React from "react"
import Select, { type MultiValue, type StylesConfig } from "react-select"
import AsyncSelect from "react-select/async"

export type ReactMultiSelectOption = {
  value: string
  label: string
  disabled?: boolean
  isDisabled?: boolean
}

export type ReactMultiSelectProps = {
  options?: ReactMultiSelectOption[]
  /** Async loader called on search input — enables API fetching. */
  loadOptions?: (inputValue: string) => Promise<ReactMultiSelectOption[]>
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  noOptionsMessage?: string
  loadingMessage?: string
  disabled?: boolean
  isDisabled?: boolean
  searchable?: boolean
  isSearchable?: boolean
  isLoading?: boolean
  cacheOptions?: boolean
  defaultOptions?: boolean | ReactMultiSelectOption[]
  closeMenuOnSelect?: boolean
  maxCount?: number // kept for API compat, react-select shows all selected as pills
  className?: string
  id?: string
  "aria-label"?: string
  apiUrl?: string
}

const multiStyles: StylesConfig<ReactMultiSelectOption, true> = {
  control: (base, state) => ({
    ...base,
    minHeight: "2.5rem",
    backgroundColor: "transparent",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: state.isFocused ? "var(--ring)" : "var(--input)",
    borderTopColor: "transparent",
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderRadius: 0,
    boxShadow: state.isFocused ? "0 0 0 2px var(--ring)" : "none",
    "&:hover": {
      borderColor: state.isFocused ? "var(--ring)" : "var(--input)",
    },
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "2px 0",
    gap: "4px",
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: "var(--muted)",
    borderRadius: 0,
    border: "1px solid var(--input)",
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: "var(--foreground)",
    fontSize: "0.75rem",
    padding: "2px 6px",
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: "var(--muted-foreground)",
    ":hover": {
      backgroundColor: "var(--foreground)",
      color: "var(--background)",
    },
  }),
  input: (base) => ({
    ...base,
    margin: 0,
    padding: 0,
  }),
  placeholder: (base) => ({
    ...base,
    color: "var(--muted-foreground)",
  }),
  menu: (base) => ({
    ...base,
    borderRadius: 0,
    marginTop: 4,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    border: "1px solid var(--border)",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "var(--muted)"
      : state.isFocused
        ? "var(--muted)"
        : "transparent",
    color: "var(--foreground)",
    fontSize: "0.875rem",
    padding: "0.5rem 0.75rem",
    cursor: state.isDisabled ? "not-allowed" : "pointer",
    opacity: state.isDisabled ? 0.5 : 1,
  }),
}

function ReactMultiSelect({
  options = [],
  loadOptions,
  value,
  defaultValue = [],
  onValueChange,
  placeholder = "Select options",
  searchPlaceholder: _searchPlaceholder,
  emptyText = "No results found.",
  noOptionsMessage,
  loadingMessage = "Loading...",
  disabled = false,
  isDisabled,
  searchable = true,
  isSearchable,
  isLoading = false,
  cacheOptions = true,
  defaultOptions = true,
  closeMenuOnSelect = false,
  maxCount: _maxCount,
  className,
  id,
  "aria-label": ariaLabel,
  apiUrl,
}: ReactMultiSelectProps) {
  const isControlled = value !== undefined
  const [internalValue, setInternalValue] = React.useState<string[]>(defaultValue)
  const currentValue = isControlled ? value : internalValue

  const isDisabledFinal = isDisabled ?? disabled
  const isSearchableFinal = isSearchable ?? searchable

  const fetcher = React.useCallback(
    async (inputValue: string): Promise<ReactMultiSelectOption[]> => {
      if (loadOptions) return loadOptions(inputValue)
      if (apiUrl) {
        try {
          const url = `${apiUrl}${apiUrl.includes("?") ? "&" : "?"}q=${encodeURIComponent(inputValue)}`
          const res = await fetch(url, { credentials: "include" })
          if (!res.ok) return []
          const data = await res.json()
          if (Array.isArray(data)) return data
          if (Array.isArray((data as { data?: unknown }).data))
            return (data as { data: ReactMultiSelectOption[] }).data
          if (Array.isArray((data as { options?: unknown }).options))
            return (data as { options: ReactMultiSelectOption[] }).options
          return []
        } catch {
          return []
        }
      }
      if (!inputValue) return options
      return options.filter((o) => o.label.toLowerCase().includes(inputValue.toLowerCase()))
    },
    [loadOptions, apiUrl, options],
  )

  const selectedOptions = React.useMemo(() => {
    return currentValue
      .map((val) => options.find((o) => o.value === val) ?? { value: val, label: val })
      .filter(Boolean)
  }, [currentValue, options])

  const handleChange = (newValue: MultiValue<ReactMultiSelectOption>) => {
    const next = (newValue as ReactMultiSelectOption[]).map((o) => o.value)
    if (!isControlled) setInternalValue(next)
    onValueChange?.(next)
  }

  const commonProps = {
    inputId: id,
    "aria-label": ariaLabel,
    placeholder,
    isDisabled: isDisabledFinal,
    isSearchable: isSearchableFinal,
    isMulti: true as const,
    isLoading,
    closeMenuOnSelect,
    className: cn("w-full text-sm", className),
    styles: multiStyles,
    noOptionsMessage: () => noOptionsMessage ?? emptyText,
    loadingMessage: () => loadingMessage,
    isOptionDisabled: (opt: ReactMultiSelectOption) => !!opt.disabled || !!opt.isDisabled,
  }

  if (apiUrl || loadOptions) {
    return (
      <AsyncSelect<ReactMultiSelectOption, true>
        {...commonProps}
        value={selectedOptions}
        defaultOptions={defaultOptions}
        loadOptions={fetcher}
        cacheOptions={cacheOptions}
        onChange={handleChange}
      />
    )
  }

  return (
    <Select<ReactMultiSelectOption, true>
      {...commonProps}
      value={selectedOptions}
      options={options}
      onChange={handleChange}
    />
  )
}

export { ReactMultiSelect }
