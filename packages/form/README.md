# @workspace/form

Accessible, type-safe form primitives for React — built on **react-hook-form** + **zod** and styled with `@workspace/ui` primitives. Compliant with international standards out of the box.

## International standards compliance

| Standard | How this package meets it |
|---|---|
| **WCAG 2.1 AA** (1.3.1, 3.3.1, 3.3.2, 4.1.2, 4.1.3) | Every field wires `htmlFor ↔ id`, `aria-describedby` (description + error), `aria-invalid`, `aria-required`, `role="alert"` + `aria-live="polite"` for errors |
| **WAI-ARIA 1.2** — Forms, Checkbox, Switch, Radiogroup, Slider, Alert | Roles and states delegated to Radix primitives; focus management via `Slot` |
| **HTML Living Standard §4.10** | Native semantics preserved (`<label>`, `<input>`, `<select>`, `<textarea>`, `<fieldset>`-like grouping via `FormItem`) |
| **WCAG 1.3.5 Identify Input Purpose** | All inputs expose `autoComplete`, `inputMode`, `type` passthrough — set e.g. `autoComplete="email"` |
| **i18n / l10n (ISO 639, Unicode CLDR)** | No hardcoded strings; `lang`/`dir` inherited; `Calendar` respects `locale`; error messages come from `zod`/`react-hook-form` and can be localized via `zod` i18n or `react-i18next` |
| **ISO/IEC 25010 (Maintainability, Reliability)** | Strict TypeScript (`strict`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`), generic `FieldPath<T>` inference, fail-fast `useFormField` errors, 100% peer-dep isolation |
| **NPM package standard (ECMA, SemVer)** | ESM-only, `sideEffects: false`, `peerDependencies` for `react`/`react-hook-form`/`radix-ui`, `exports` with types |

## Installation

```bash
pnpm add @workspace/form @workspace/schema @workspace/ui react-hook-form @hookform/resolvers zod
# peer: react, react-dom, radix-ui are already provided by @workspace/ui
```

## Quick start

```tsx
import { Form, FormCheckbox, FormInput, useForm } from "@workspace/form"
import { Button } from "@workspace/ui/components/primitives/button"
import { z } from "zod"

const schema = z.object({
  fullName: z.string().min(1).max(128),
  email: z.string().email(),
  agree: z.boolean().refine((v) => v, "You must accept the terms"),
})
type Values = z.infer<typeof schema>

export function MyForm() {
  // Package `useForm` builds the zodResolver for you, defaults to
  // mode: "onTouched", reValidateMode: "onChange". Pass `resolver`
  // explicitly to override, `values` to resync from an API query.
  const form = useForm<Values>({
    schema,
    defaultValues: { fullName: "", email: "", agree: false },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((v) => console.log(v))} noValidate className="grid gap-4">
        <FormInput<Values> name="fullName" label="Full name" required autoComplete="name" />
        <FormInput<Values> name="email" label="Email" required autoComplete="email" inputMode="email" />
        <FormCheckbox<Values> name="agree" label="I accept the terms" required />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
```

### A11y checklist for consumers

- Always provide a `label` for every field (WCAG 3.3.2).
- Mark required fields with `required` prop — renders `*` + `aria-required`.
- Set `autoComplete` for credential/personal data fields (WCAG 1.3.5).
- Wrap submissions with `<form noValidate>` and rely on resolver errors (prevents duplicate native/browser messages).
- Error regions are `role="alert"` + `aria-live="polite"` — screen readers announce without focus loss.

### Provided components

`Form`, `FormWrapper` (+ `FormWrapper.Content` / `FormWrapper.Footer` layout helpers), `useForm`, `useFormClassic` (raw react-hook-form passthrough, no schema handling), `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`, `useFormField`, `handleFieldError` + `FieldError` type for server-side errors, plus typed wrappers: `FormInput`, `FormTextarea`, `FormPassword`, `FormCheckbox`, `FormSwitch`, `FormRadioGroup`, `FormSlider`/`FormRangeSlider`, `FormSelect`, `FormNativeSelect`, `FormMultiSelect`, `FormPhoneInput`, `FormDatePicker`, `FormCalendar`, `FormInputOTP`, `FormAttachment`.

All wrappers are generic: `<FormInput<Values> name="email" />` infers `name` from your schema type `Values`. (Inside a `FormProvider` the generic can be omitted — it is inferred from context.)

### Typical usage in this repo — schema → hook → component → route

`apps/admin` auth screens follow one pattern (see `apps/admin/src/features/auth/` + `routes/auth/login.tsx`):

1. **Schema** (`features/<domain>/schemas/`): zod object, composed from `@workspace/schema` primitives. Single source of truth; export both schema and `z.infer` type.
2. **Form hook** (`features/<domain>/hooks/form-handler/use-<x>.form.ts`): calls package `useForm<Schema>({ schema, defaultValues })`, returns `{ form }`. Add `values` when resyncing from a query (e.g. profile data).
3. **Presentational component** (`features/<domain>/components/forms/<x>-form.tsx`): renders typed wrappers only (`<FormInput name="email" …/>`), no form instance, no mutation. Receives UI state (`isPending`) via props.
4. **Route/page**: wires hook + mutation, builds `form.handleSubmit(onValid)`, maps API failures with `handleFieldError(form, errors)` (field-level) or `form.setError(name, { type: "server", message })` (form-level), renders `<FormWrapper form={form} formProps={{ onSubmit: handleSubmit }}>`.

```tsx
// 1. schemas/login.ts
export const loginSchema = z.object({ email: emailSchema, password: z.string().min(1).max(128) })
export type LoginSchema = z.infer<typeof loginSchema>

// 2. hooks/form-handler/use-login.form.ts
export function useLoginForm() {
  const form = useForm<LoginSchema>({ schema: loginSchema, defaultValues: { email: "", password: "" } })
  return { form }
}

// 3. components/forms/login-form.tsx — presentational only
export function LoginForm({ isPending }: { isPending?: boolean }) {
  return (
    <div className="grid gap-4">
      <FormInput name="email" label="Email" required autoComplete="email" />
      <FormPassword name="password" label="Password" required autoComplete="current-password" />
      <Button type="submit" disabled={isPending}>Sign in</Button>
    </div>
  )
}

// 4. routes/auth/login.tsx — wiring
const { form } = useLoginForm()
const loginMutation = useLoginMutation()
const handleSubmit = form.handleSubmit((data) =>
  loginMutation.mutate(data, {
    onError: (err: APIError<FieldError<LoginSchema>>) => {
      const fieldErrors = err.response?.data.errors
      if (fieldErrors) return handleFieldError(form, fieldErrors) // 422 → inline field errors
      form.setError("password", { type: "server", message: "Invalid credentials" })
    },
  }),
)
return (
  <FormWrapper form={form} formProps={{ onSubmit: handleSubmit }} className="grid gap-4">
    <LoginForm isPending={loginMutation.isPending} />
  </FormWrapper>
)
```

`handleFieldError(form, errors, fieldMap?)` sets API-returned `{ [field]: message }` objects onto the form (with optional API-key → form-path mapping). `FieldError<T>` types that payload.

### Page-level layouts — `FormWrapper`

`FormWrapper` composes `FormProvider` + `<form>` so a page can lay out header / scroll area / footer. Actual props: `form` (the `useForm` return), `formProps` (spread onto `<form>` — put `onSubmit` here), `className`, `id`, `noValidate` (defaults `true`, keeps Zod as the single validator), and `children` (nodes or a render-prop `(form) => …` for form-state access). Layout helpers: `FormWrapper.Content` (scrollable section) and `FormWrapper.Footer` (sticky action bar).

```tsx
import { AccountInformationForm } from '@/features/settings/account-settings/components';
import {
  useAccountInformationForm,
  useAccountInformationMutation,
} from '@/features/settings/account-settings/hooks';
import { FormWrapper, useForm } from '@workspace/form'; // also available as @package/form via alias
import { Button, PageHeader } from '@workspace/ui';
import { accountInformationSchema, type AccountInformationSchema } from '../../schemas/account-information.schemas';

// 1. schema-based useForm with values sync (replaces useForm({ resolver: zodResolver(...) }))
export function useAccountInformationForm() {
  const { data } = useMeQuery();
  const defaultValues = {
    avatar: '', fullName: '', username: '', phoneNumber: '', country: '', email: '',
  };
  const values = {
    avatar: data?.data?.data?.user?.avatar ?? '',
    fullName: data?.data?.data?.user?.full_name ?? '',
    username: data?.data?.data?.user?.username ?? '',
    phoneNumber: data?.data?.data?.user?.phone_number ?? '',
    country: data?.data?.data?.user?.country?.uuid ?? '',
    email: data?.data?.data?.user?.email ?? '',
  };
  const form = useForm<AccountInformationSchema>({
    schema: accountInformationSchema,
    defaultValues,
    values, // controlled — resyncs when `data` loads
    mode: 'onTouched',
  });
  return { form, values };
}

// 2. Page with FormWrapper (header + scroll + footer)
export default function AccountInformationPage() {
  const accountInformationForm = useAccountInformationForm();
  const accountInformationMutation = useAccountInformationMutation();
  const handleSubmit = accountInformationForm.form.handleSubmit(
    (data) => {
      accountInformationMutation.mutate({
        avatar: data.avatar ?? '',
        ...(data.fullName && { full_name: data.fullName }),
        ...(data.phoneNumber && { phone_number: data.phoneNumber }),
        ...(data.country && { country_uuid: data.country }),
      });
    },
    (error) => console.error(error),
  );
  return (
    <FormWrapper
      form={accountInformationForm.form}
      formProps={{ onSubmit: handleSubmit }}
      className="h-full pt-6 flex flex-col overflow-hidden"
    >
      <section className="px-11 flex-1 overflow-y-auto">
        <PageHeader title="Account Information" description="Update your photo and other details here." />
        <AccountInformationForm /> {/* inside: <FormInput name="fullName" /> etc. */}
      </section>
      <div className="h-20 px-11 border-t flex items-center gap-3 justify-end shadow-[0_-1px_8px_3px_rgba(0,0,0,0.03)] shrink-0">
        <Button type="button" variant="secondary" onClick={() => accountInformationForm.form.reset()} disabled={!accountInformationForm.form.formState.isDirty}>
          Cancel
        </Button>
        <Button type="submit" onClick={handleSubmit} isPending={accountInformationMutation.isPending} disabled={!accountInformationForm.form.formState.isDirty || accountInformationMutation.isPending}>
          Update
        </Button>
      </div>
    </FormWrapper>
  );
}
```

#### Layout helpers + render-prop (all supported)

```tsx
// 1. Content / Footer compounds for page layouts
<FormWrapper form={form} formProps={{ onSubmit: handleSubmit }} className="h-full flex flex-col">
  <FormWrapper.Content className="px-11 flex-1 overflow-y-auto">
    <AccountInformationForm />
  </FormWrapper.Content>
  <FormWrapper.Footer>
    <Button type="button" variant="secondary" onClick={() => form.reset()}>Cancel</Button>
    <Button type="submit">Update</Button>
  </FormWrapper.Footer>
</FormWrapper>

// 2. Render-prop for easy access to form state inside
<FormWrapper form={form} formProps={{ onSubmit: handleSubmit }}>
  {(form) => (
    <>
      <section><PageHeader {...} /></section>
      <Button disabled={!form.formState.isDirty}>Update</Button>
    </>
  )}
</FormWrapper>
```

Classic `<Form {...form}><form>` + manual `zodResolver` still works — `useForm` also accepts `resolver` passthrough (explicit resolver wins over `schema`):

---

## Form Usage Examples

All examples compose reusable primitives from `@workspace/schema` — single source of truth.

```ts
// reusable primitives
import { emailSchema, strongPasswordSchema, fullNameSchema } from "@workspace/schema"
import { z } from "zod"
// compose your own domain schemas
export const registerSchema = z.object({ email: emailSchema, password: strongPasswordSchema })
export const loginSchema = z.object({ email: emailSchema, password: z.string().min(1) })
export const onboardingSchema = z.object({ fullName: fullNameSchema })
export const updateProfileSchema = z.object({ fullName: z.string().trim().max(128).optional() })
```

### 1. Register Form

```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { emailSchema, strongPasswordSchema } from "@workspace/schema"
import { Form, FormInput } from "@workspace/form"
import { Button } from "@workspace/ui/components/primitives/button"

export const registerSchema = z.object({ email: emailSchema, password: strongPasswordSchema })
type RegisterInput = z.infer<typeof registerSchema>

export function RegisterForm() {
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = async (data: RegisterInput) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error(await res.text())
    // show "verification link sent" message
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="grid gap-4">
        <FormInput<RegisterInput> name="email" label="Email" required autoComplete="email" placeholder="you@example.com" />
        <FormInput<RegisterInput> name="password" label="Password" required type="password" autoComplete="new-password" description="Min 12 chars, upper/lower, number & special char" />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </Form>
  )
}
```

### 2. Login Form

```tsx
import { emailSchema } from "@workspace/schema"
import { z } from "zod"

export const loginSchema = z.object({ email: emailSchema, password: z.string().min(1).max(128) })
type LoginInput = z.infer<typeof loginSchema>

export function LoginForm() {
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(async (data) => {
        const res = await fetch("/api/auth/login", { method: "POST", body: JSON.stringify(data) })
        // handle 401/403/423, store accessToken, refresh cookie is httpOnly
      })} noValidate className="grid gap-4">
        <FormInput<LoginInput> name="email" label="Email" required autoComplete="email" />
        <FormInput<LoginInput> name="password" label="Password" required type="password" autoComplete="current-password" />
        <Button type="submit">Sign in</Button>
      </form>
    </Form>
  )
}
```

### 3. Onboarding Form (after email verification)

```tsx
import { fullNameSchema } from "@workspace/schema"

export const onboardingSchema = z.object({ fullName: fullNameSchema })
type OnboardingInput = z.infer<typeof onboardingSchema>

export function OnboardingForm({ token }: { token: string }) {
  // verify token first via POST /auth/verify-email, then show this form
  const form = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { fullName: "" },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(async (data) => {
        await fetch("/api/user/onboarding", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
      })} noValidate className="grid gap-4">
        <FormInput<OnboardingInput> name="fullName" label="Full name" required autoComplete="name" placeholder="Jane Doe" description="This will be visible on your profile" />
        <Button type="submit">Complete onboarding</Button>
      </form>
    </Form>
  )
}
```

### 4. Update Profile Form

```tsx
export const updateProfileSchema = z.object({ fullName: z.string().trim().max(128).optional() })
type UpdateProfileInput = z.infer<typeof updateProfileSchema>

export function ProfileForm({ initialName }: { initialName: string | null }) {
  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { fullName: initialName ?? "" },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(async (data) => {
        await fetch("/api/user/me", { method: "PATCH", body: JSON.stringify(data) })
      })} noValidate className="grid gap-4">
        <FormInput<UpdateProfileInput> name="fullName" label="Full name" description="Leave empty to keep current" />
        <Button type="submit">Save changes</Button>
      </form>
    </Form>
  )
}
```

### 5. All Components Showcase

```tsx
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Form, FormInput, FormTextarea, FormCheckbox, FormSwitch,
  FormRadioGroup, FormSelect, FormMultiSelect, FormSlider, FormInputOTP, FormCalendar
} from "@workspace/form"

const showcaseSchema = z.object({
  bio: z.string().max(500).optional(),
  newsletter: z.boolean(),
  notifications: z.boolean(),
  plan: z.enum(["free", "pro", "enterprise"]),
  interests: z.array(z.string()).min(1),
  volume: z.number().min(0).max(100),
  otp: z.string().length(6),
  birthday: z.date(),
  country: z.string().min(1),
})
type ShowcaseValues = z.infer<typeof showcaseSchema>

export function ShowcaseForm() {
  const form = useForm<ShowcaseValues>({
    resolver: zodResolver(showcaseSchema),
    defaultValues: {
      bio: "", newsletter: false, notifications: true,
      plan: "free", interests: [], volume: 50, otp: "", birthday: undefined, country: ""
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(console.log)} noValidate className="grid gap-6">
        <FormTextarea<ShowcaseValues> name="bio" label="Bio" description="Max 500 characters" rows={4} />
        <FormCheckbox<ShowcaseValues> name="newsletter" label="Subscribe to newsletter" description="Get updates via email" />
        <FormSwitch<ShowcaseValues> name="notifications" label="Push notifications" description="Receive on this device" />
        <FormRadioGroup<ShowcaseValues> name="plan" label="Plan" required options={[
          { value: "free", label: "Free" },
          { value: "pro", label: "Pro" },
          { value: "enterprise", label: "Enterprise" },
        ]} />
        <FormSelect<ShowcaseValues> name="country" label="Country" required placeholder="Select country" options={[
          { value: "np", label: "Nepal" },
          { value: "us", label: "USA" },
        ]} />
        <FormMultiSelect<ShowcaseValues> name="interests" label="Interests" placeholder="Pick interests" options={[
          { value: "design", label: "Design" },
          { value: "code", label: "Code" },
        ]} />
        {/* Async select with API search */}
        <FormSelect<ShowcaseValues> name="country" label="Country (async)" apiUrl="/api/countries" placeholder="Type to search..." />
        <FormMultiSelect<ShowcaseValues> name="interests" label="Tags (async)" apiUrl="/api/tags" placeholder="Search tags..." />
        <FormSlider<ShowcaseValues> name="volume" label="Volume" min={0} max={100} />
        <FormInputOTP<ShowcaseValues> name="otp" label="One-time code" maxLength={6} />
        <FormCalendar<ShowcaseValues> name="birthday" label="Birthday" required />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
```

### 6. Low-level `FormField` for custom UI

```tsx
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@workspace/form"
import { Input } from "@workspace/ui/components/primitives/input"

<FormField
  control={form.control}
  name="custom"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Custom field</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

---

## License

MIT
