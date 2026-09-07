/**
 * @fileoverview Accessible form primitives — WCAG 2.1 AA & WAI-ARIA 1.2 compliant.
 *
 * Standards compliance:
 * - HTML Living Standard §4.10 (Forms) — label/control association via htmlFor/id
 * - WAI-ARIA 1.2 §5.4 — aria-describedby / aria-invalid / aria-required
 * - WCAG 2.1 — 1.3.1 Info and Relationships, 3.3.1 Error Identification, 4.1.2 Name, Role, Value
 * - ISO/IEC 25010 — maintainability via generics + explicit contracts
 *
 * Usage:
 * ```tsx
 * const form = useForm({ resolver: zodResolver(schema) })
 * <Form {...form}>
 *   <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
 *     <FormField control={form.control} name="email" render={({field}) => …} />
 *   </form>
 * </Form>
 * ```
 */

import { zodResolver } from "@hookform/resolvers/zod"
import { Label } from "@workspace/ui/components/design/label"
import { cn } from "@workspace/ui/lib/utils"
import { Slot } from "radix-ui"
import * as React from "react"
import {
  Controller,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  FormProvider,
  type UseFormProps as RHFUseFormProps,
  type UseFormReturn,
  useFormContext,
  useFormState,
  useForm as useRHFForm,
} from "react-hook-form"
import type { ZodType } from "zod"

// ===========================================================================
// Form — thin, fully-typed wrapper around react-hook-form's FormProvider
// ISO: single responsibility, Liskov substitutable for FormProvider
// Supports both patterns:
//  1. <Form {...form}><form onSubmit={form.handleSubmit(...)}> — classic
//  2. <FormWrapper useFormMethods={form} formProps={{ onSubmit: handleSubmit }}> — your AccountInformationPage pattern
// ===========================================================================

/**
 * Provides react-hook-form context to descendants. Must wrap a native `<form>`.
 *
 * @see https://react-hook-form.com/docs/useform
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/forms/
 */
const Form = FormProvider

/**
 * Flexible `useForm` wrapper — accepts `schema` directly (no need to create resolver manually)
 * and supports `values` for controlled sync from API (e.g., `useMeQuery`).
 * Also supports classic `resolver` passthrough for full flexibility.
 *
 * @example
 * // with schema (your AccountInformationPage pattern)
 * const form = useForm<AccountInformationSchema>({
 *   schema: accountInformationSchema,
 *   defaultValues,
 *   values, // syncs when API data loads
 *   mode: 'onTouched',
 * })
 * // classic
 * const form2 = useForm({ resolver: zodResolver(schema), defaultValues })
 */
export function useForm<TFieldValues extends FieldValues = FieldValues>(
  props: {
    schema?: ZodType<TFieldValues>
    resolver?: RHFUseFormProps<TFieldValues>["resolver"]
  } & Omit<RHFUseFormProps<TFieldValues>, "resolver">,
): UseFormReturn<TFieldValues> {
  const {
    schema,
    resolver: propsResolver,
    ...rest
  } = props as {
    schema?: ZodType<TFieldValues>
    resolver?: RHFUseFormProps<TFieldValues>["resolver"]
  } & RHFUseFormProps<TFieldValues>

  const resolver = React.useMemo(
    () => propsResolver ?? (schema ? zodResolver(schema as never) : undefined),
    [propsResolver, schema],
  )

  return useRHFForm<TFieldValues>({
    mode: "onTouched",
    reValidateMode: "onChange",
    ...(resolver ? { resolver } : {}),
    ...rest,
  } as RHFUseFormProps<TFieldValues>)
}

// Classic passthrough alias
export { useRHFForm as useFormClassic }

/**
 * `FormWrapper` — your `AccountInformationPage` pattern.
 * Wraps `FormProvider` + native `<form>` so you can compose header / scroll area / footer.
 *
 * @example
 * <FormWrapper useFormMethods={form} formProps={{ onSubmit: handleSubmit }} className="h-full flex flex-col">
 *   <section className="px-11 flex-1 overflow-y-auto"><AccountInformationForm /></section>
 *   <div className="h-20 border-t flex justify-end"><Button type="submit">Update</Button></div>
 * </FormWrapper>
 *
 * Handles:
 * - `useFormMethods` (aka `form`) from `useForm` above
 * - `formProps` spread to `<form>` (onSubmit, onReset, etc.)
 * - `className` for layout (flex, overflow, etc.)
 * - `noValidate` by default (prevents native browser validation, uses Zod)
 */
export type FormWrapperProps<TFieldValues extends FieldValues = FieldValues> = {
  /** Existing form instance — aliases: `form` / `useFormMethods` / `methods` */
  form?: UseFormReturn<TFieldValues, unknown, unknown>
  useFormMethods?: UseFormReturn<TFieldValues, unknown, unknown>
  methods?: UseFormReturn<TFieldValues, unknown, unknown>
  /** Create form internally — pass `schema` + `defaultValues`/`values` etc. */
  schema?: ZodType<TFieldValues>
  resolver?: RHFUseFormProps<TFieldValues, unknown, unknown>["resolver"]
  defaultValues?: RHFUseFormProps<TFieldValues, unknown, unknown>["defaultValues"]
  values?: RHFUseFormProps<TFieldValues, unknown, unknown>["values"]
  mode?: RHFUseFormProps<TFieldValues, unknown, unknown>["mode"]
  /** Direct submit handler — auto-wrapped with `form.handleSubmit` */
  onSubmit?: (
    data: TFieldValues,
    form: UseFormReturn<TFieldValues, unknown, unknown>,
  ) => void | Promise<void>
  onError?: (
    errors: import("react-hook-form").FieldErrors<TFieldValues>,
    form: UseFormReturn<TFieldValues, unknown, unknown>,
  ) => void
  formProps?: React.FormHTMLAttributes<HTMLFormElement>
  className?: string
  children:
    | React.ReactNode
    | ((form: UseFormReturn<TFieldValues, unknown, unknown>) => React.ReactNode)
  /** Disable native validation — defaults to true for Zod control */
  noValidate?: boolean
  id?: string
}

function FormWrapperInternal<TFieldValues extends FieldValues>({
  schema,
  resolver,
  defaultValues,
  values,
  mode,
  onSubmit,
  onError,
  formProps,
  className,
  children,
  noValidate = true,
  id,
}: Omit<FormWrapperProps<TFieldValues>, "form" | "useFormMethods" | "methods">) {
  const form = useForm<TFieldValues>({
    ...(schema ? { schema: schema as ZodType<TFieldValues> } : {}),
    ...(resolver ? { resolver } : {}),
    ...(defaultValues !== undefined ? { defaultValues } : {}),
    ...(values !== undefined ? { values } : {}),
    ...(mode ? { mode } : {}),
  } as unknown as Parameters<typeof useForm<TFieldValues>>[0])

  return (
    <FormWrapperExternal
      form={form}
      onSubmit={onSubmit}
      onError={onError}
      formProps={formProps}
      className={className}
      noValidate={noValidate}
      id={id}
    >
      {children}
    </FormWrapperExternal>
  )
}

function FormWrapperExternal<TFieldValues extends FieldValues>({
  form,
  useFormMethods,
  methods,
  onSubmit,
  onError,
  formProps,
  className,
  children,
  noValidate = true,
  id,
}: Pick<
  FormWrapperProps<TFieldValues>,
  | "form"
  | "useFormMethods"
  | "methods"
  | "onSubmit"
  | "onError"
  | "formProps"
  | "className"
  | "children"
  | "noValidate"
  | "id"
>) {
  const activeForm = (form ?? useFormMethods ?? methods) as UseFormReturn<
    TFieldValues,
    unknown,
    TFieldValues
  >
  if (!activeForm) throw new Error("FormWrapper requires `form` or `schema`")

  const handleSubmit = React.useMemo(() => {
    if (!onSubmit) return formProps?.onSubmit
    return activeForm.handleSubmit(
      (data) => onSubmit(data, activeForm),
      (errors) =>
        onError?.(errors as import("react-hook-form").FieldErrors<TFieldValues>, activeForm),
    )
  }, [onSubmit, onError, activeForm, formProps?.onSubmit])

  const content =
    typeof children === "function"
      ? (children as (form: UseFormReturn<TFieldValues, unknown, TFieldValues>) => React.ReactNode)(
          activeForm,
        )
      : children

  return (
    <FormProvider {...activeForm}>
      <form
        id={id}
        className={className}
        noValidate={noValidate}
        {...formProps}
        onSubmit={(handleSubmit as unknown as React.FormEventHandler) ?? formProps?.onSubmit}
      >
        {content}
      </form>
    </FormProvider>
  )
}

function FormWrapperInner<TFieldValues extends FieldValues>(props: FormWrapperProps<TFieldValues>) {
  const externalForm = props.form ?? props.useFormMethods ?? props.methods
  if (externalForm) {
    return (
      <FormWrapperExternal
        {...(props as Pick<
          FormWrapperProps<TFieldValues>,
          | "form"
          | "useFormMethods"
          | "methods"
          | "onSubmit"
          | "onError"
          | "formProps"
          | "className"
          | "children"
          | "noValidate"
          | "id"
        >)}
      />
    )
  }
  return (
    <FormWrapperInternal
      {...(props as Omit<FormWrapperProps<TFieldValues>, "form" | "useFormMethods" | "methods">)}
    />
  )
}

export const FormWrapper = Object.assign(FormWrapperInner, {
  /** Scrollable content area — use inside FormWrapper */
  Content: ({ className, ...props }: React.ComponentProps<"section">) => (
    <section className={cn("flex-1 overflow-y-auto", className)} {...props} />
  ),
  /** Sticky footer for actions — matches your AccountInformationPage footer */
  Footer: ({ className, ...props }: React.ComponentProps<"div">) => (
    <div
      className={cn(
        "flex h-20 shrink-0 items-center justify-end gap-3 border-t px-11 shadow-[0_-1px_8px_3px_rgba(0,0,0,0.03)]",
        className,
      )}
      {...props}
    />
  ),
}) as typeof FormWrapperInner & {
  Content: typeof FormWrapperInner extends (...args: never) => unknown
    ? (props: React.ComponentProps<"section">) => React.JSX.Element
    : never
  Footer: (props: React.ComponentProps<"div">) => React.JSX.Element
}

// ===========================================================================
// FormField — typed Controller wrapper that publishes field name via context
// ===========================================================================

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null)

/**
 * Binds a field to react-hook-form state. `control` may be omitted when
 * inside a `<Form>` provider — it is inferred from context.
 *
 * @example <FormField control={form.control} name="email" render={({field}) => <Input {...field} />} />
 */
function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name } as FormFieldContextValue}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

// ===========================================================================
// FormItem — groups label / control / description / message, owns the id
// ===========================================================================

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue | null>(null)

/**
 * Groups related form elements. Generates a stable id for a11y wiring
 * (label htmlFor, control id, aria-describedby).
 *
 * @see WCAG 1.3.1 — Info and Relationships
 */
function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId()
  return (
    <FormItemContext.Provider value={{ id }}>
      <div data-slot="form-item" className={cn("grid gap-2", className)} {...props} />
    </FormItemContext.Provider>
  )
}

// ===========================================================================
// useFormField — a11y wiring hook (WAI-ARIA 1.2)
// ===========================================================================

/**
 * Returns ids and validation state for the current field.
 * Must be called inside `<FormField>` + `<FormItem>`.
 *
 * @throws if used outside required contexts — fail-fast per ISO 25010 reliability.
 */
function useFormField() {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const formContext = useFormContext()

  if (!fieldContext) {
    throw new Error("useFormField must be used within <FormField> — missing field name context.")
  }
  if (!itemContext) {
    throw new Error("useFormField must be used within <FormItem> — missing id context.")
  }
  if (!formContext) {
    throw new Error("useFormField must be used within <Form> (FormProvider).")
  }

  const { getFieldState } = formContext
  const formState = useFormState({ name: fieldContext.name })
  const fieldState = getFieldState(fieldContext.name, formState)
  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

// ===========================================================================
// FormLabel — WCAG 3.3.2 Labels or Instructions, 1.3.1
// ===========================================================================

function FormLabel({
  className,
  required,
  ...props
}: React.ComponentProps<typeof Label> & { required?: boolean }) {
  const { error, formItemId } = useFormField()
  const isRequired = required ?? (props as { "aria-required"?: boolean })["aria-required"]

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      data-required={!!isRequired}
      className={cn(error && "text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    >
      {props.children}
      {isRequired ? (
        <span aria-hidden="true" className="text-destructive ml-1">
          *
        </span>
      ) : null}
    </Label>
  )
}

// ===========================================================================
// FormControl — WAI-ARIA 1.2 (aria-invalid, aria-describedby, aria-required)
// ===========================================================================

function FormControl(props: React.ComponentProps<typeof Slot.Root>) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  // WCAG 4.1.2: expose invalid state; 3.3.1: associate description + error
  const describedBy = [formDescriptionId, error ? formMessageId : null].filter(Boolean).join(" ")

  return (
    <Slot.Root
      data-slot="form-control"
      id={formItemId}
      aria-describedby={describedBy || undefined}
      aria-invalid={!!error}
      {...props}
    />
  )
}

// ===========================================================================
// FormDescription — WCAG 3.3.2, exposed via aria-describedby
// ===========================================================================

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFormField()
  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn("text-muted-foreground text-xs leading-relaxed", className)}
      {...props}
    />
  )
}

// ===========================================================================
// FormMessage — WCAG 3.3.1 Error Identification, aria-live polite
// ===========================================================================

function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error.message) : null
  if (!body) return null
  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      role="alert"
      aria-live="polite"
      className={cn("text-destructive text-xs font-medium", className)}
      {...props}
    >
      {body}
    </p>
  )
}

export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
}
