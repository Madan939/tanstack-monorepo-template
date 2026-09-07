import { cn } from "@workspace/ui/lib/utils"
import * as React from "react"
import Select, { type SingleValue, type StylesConfig } from "react-select"
import AsyncSelect from "react-select/async"

export type ReactSelectOption = {
  value: string
  label: string
  disabled?: boolean
  isDisabled?: boolean
}

export type ReactSelectProps = {
  options?: ReactSelectOption[]
  /** Async loader called on search input — enables API fetching. */
  loadOptions?: (inputValue: string) => Promise<ReactSelectOption[]>
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  noOptionsMessage?: string
  loadingMessage?: string
  disabled?: boolean
  isDisabled?: boolean
  searchable?: boolean
  isSearchable?: boolean
  clearable?: boolean
  isClearable?: boolean
  isLoading?: boolean
  cacheOptions?: boolean
  defaultOptions?: boolean | ReactSelectOption[]
  className?: string
  id?: string
  "aria-label"?: string
  /**
   * API URL template for async search. When provided and `loadOptions` is not
   * set, a default fetcher calls `GET ${apiUrl}?q=${inputValue}` and expects
   * `Option[]` or `{ data: Option[] }`.
   * Example: `apiUrl="/api/users"` → fetches `/api/users?q=john`
   */
  apiUrl?: string
}

const selectStyles: StylesConfig<ReactSelectOption, false> = {
  control: (base, state) => ({
    ...base,
    minHeight: "2.5rem",
    height: "2.5rem",
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
    padding: "0 0",
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

function ReactSelect({
  options = [],
  loadOptions,
  value,
  defaultValue,
  onValueChange,
  placeholder = "Select an option",
  searchPlaceholder: _searchPlaceholder, // kept for API compat, react-select uses placeholder for search
  emptyText = "No results found.",
  noOptionsMessage,
  loadingMessage = "Loading...",
  disabled = false,
  isDisabled,
  searchable = true,
  isSearchable,
  clearable = false,
  isClearable,
  isLoading = false,
  cacheOptions = true,
  defaultOptions = true,
  className,
  id,
  "aria-label": ariaLabel,
  apiUrl,
}: ReactSelectProps) {
  const isControlled = value !== undefined
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? "")
  const currentValue = isControlled ? value : internalValue

  const isDisabledFinal = isDisabled ?? disabled
  const isSearchableFinal = isSearchable ?? searchable
  const isClearableFinal = isClearable ?? clearable

  // Build fetcher from apiUrl if loadOptions not provided but apiUrl is
  const fetcher = React.useCallback(
    async (inputValue: string): Promise<ReactSelectOption[]> => {
      if (loadOptions) return loadOptions(inputValue)
      if (apiUrl) {
        try {
          const url = `${apiUrl}${apiUrl.includes("?") ? "&" : "?"}q=${encodeURIComponent(inputValue)}`
          const res = await fetch(url, { credentials: "include" })
          if (!res.ok) return []
          const data = await res.json()
          // support both `[]` and `{ data: [] }` / `{ options: [] }`
          if (Array.isArray(data)) return data
          if (Array.isArray((data as { data?: unknown }).data))
            return (data as { data: ReactSelectOption[] }).data
          if (Array.isArray((data as { options?: unknown }).options))
            return (data as { options: ReactSelectOption[] }).options
          return []
        } catch {
          return []
        }
      }
      // fallback local filter
      if (!inputValue) return options
      return options.filter((o) => o.label.toLowerCase().includes(inputValue.toLowerCase()))
    },
    [loadOptions, apiUrl, options],
  )

  const selectedOption = React.useMemo(() => {
    if (!currentValue) return null
    return (
      options.find((o) => o.value === currentValue) ?? { value: currentValue, label: currentValue }
    )
  }, [currentValue, options])

  const handleChange = (newValue: SingleValue<ReactSelectOption>) => {
    const next = (newValue as ReactSelectOption | null)?.value ?? ""
    if (!isControlled) setInternalValue(next)
    onValueChange?.(next)
  }

  const commonProps = {
    inputId: id,
    "aria-label": ariaLabel,
    placeholder,
    isDisabled: isDisabledFinal,
    isSearchable: isSearchableFinal,
    isClearable: isClearableFinal,
    isLoading,
    className: cn("w-full text-sm", className),
    classNames: {
      control: () => cn("!min-h-10"),
    },
    styles: selectStyles,
    noOptionsMessage: () => noOptionsMessage ?? emptyText,
    loadingMessage: () => loadingMessage,
    isOptionDisabled: (opt: ReactSelectOption) => !!opt.disabled || !!opt.isDisabled,
  }

  // Async mode when apiUrl or loadOptions is provided
  if (apiUrl || loadOptions) {
    return (
      <AsyncSelect<ReactSelectOption, false>
        {...commonProps}
        value={selectedOption}
        defaultOptions={defaultOptions}
        loadOptions={fetcher}
        cacheOptions={cacheOptions}
        onChange={handleChange}
      />
    )
  }

  return (
    <Select<ReactSelectOption, false>
      {...commonProps}
      value={selectedOption}
      options={options}
      onChange={handleChange}
    />
  )
}

export { ReactSelect }
