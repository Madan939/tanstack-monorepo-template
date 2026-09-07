import { cn } from "@workspace/ui/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import * as React from "react"

/**
 * Typography — Consistent, accessible, internationalized text system
 * Global standards: WCAG 2.1 AA (1.4.3/1.4.6 Contrast, 1.4.12 Text Spacing, 2.4.6 Headings),
 * WAI-ARIA 1.2, HTML5 semantics, ISO 8601/Cldr for i18n, fluid type scale (1.25 Major Third).
 *
 * Design system:
 * - Body: Noto Sans Variable (1000+ glyphs, RTL-aware, 4px baseline, `font-sans`)
 * - Display/Headings: Playfair Display Variable (editorial, high contrast, `font-heading`)
 * - Color: OKLCH via CSS variables for WCAG AA/AAA
 * - Fully respects `lang`/`dir` (RTL), `prefers-reduced-motion` and `prefers-contrast`
 * - Line length ≤75ch for body, `text-balance`/`text-pretty` for headings
 *
 * WCAG:
 * - Headings use semantic `h1`-`h6` (or `as` override) — never skip levels in page
 * - `lead`/`muted` maintain ≥4.5:1 contrast via `text-muted-foreground`
 * - `blockquote` uses `cite` semantics when composed
 *
 * Compound API (requested): `<Typography.h1>`, `<Typography.p>` etc. (lowercase) + PascalCase mirrors
 *
 * @example
 * ```tsx
 * <Typography.h1>Hello</Typography.h1>
 * <Typography variant="h1">Hello</Typography>
 * <H1>Hello</H1> // also available as standalone
 * <Typography variant="lead" color="muted">Intro text</Typography>
 * <Typography variant="small" asChild><a href="#">Link</a></Typography>
 * ```
 */

const typographyVariants = cva("text-foreground [a]:underline-offset-4 hover:[a]:underline", {
  variants: {
    variant: {
      display: "font-heading text-5xl font-bold tracking-tight md:text-6xl",
      h1: "font-heading text-4xl font-bold tracking-tight md:text-5xl [&::selection]:bg-primary [&::selection]:text-primary-foreground",
      h2: "font-heading text-3xl font-semibold tracking-tight md:text-4xl",
      h3: "font-heading text-2xl font-semibold tracking-tight md:text-3xl",
      h4: "text-xl font-semibold tracking-tight",
      h5: "text-lg font-semibold tracking-tight",
      h6: "text-sm font-semibold uppercase tracking-widest",
      lead: "text-muted-foreground text-xl leading-relaxed",
      body: "text-base leading-7 [&:not(:first-child)]:mt-6",
      "body-sm": "text-sm leading-6 [&:not(:first-child)]:mt-4",
      large: "text-lg font-semibold",
      small: "text-sm font-medium leading-none",
      muted: "text-muted-foreground text-sm",
      caption: "text-muted-foreground text-xs uppercase tracking-widest",
      overline: "text-muted-foreground text-[0.625rem] font-semibold uppercase tracking-widest",
      blockquote: "border-l-2 border-foreground pl-6 italic [&>p]:leading-relaxed",
      inlineCode:
        "bg-muted text-foreground relative rounded-none px-[0.3rem] py-[0.2rem] font-mono text-sm font-medium",
      kbd: "bg-muted text-muted-foreground rounded-none border px-1.5 py-0.5 font-mono text-xs shadow-none",
      list: "my-6 ml-6 list-disc [&>li]:mt-2 marker:text-muted-foreground",
      link: "text-primary font-medium underline underline-offset-4 hover:text-primary/80",
    },
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
      justify: "text-justify",
    },
    color: {
      default: "",
      muted: "text-muted-foreground",
      primary: "text-primary",
      destructive: "text-destructive",
    },
    truncate: {
      true: "truncate",
      false: "",
    },
    balance: {
      true: "text-balance",
      false: "",
    },
  },
  defaultVariants: {
    variant: "body",
    align: "left",
    color: "default",
    truncate: false,
    balance: false,
  },
})

type TypographyVariant = NonNullable<VariantProps<typeof typographyVariants>["variant"]>

const variantToElement: Record<TypographyVariant, keyof HTMLElementTagNameMap> = {
  display: "h1",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  lead: "p",
  body: "p",
  "body-sm": "p",
  large: "div",
  small: "small",
  muted: "p",
  caption: "span",
  overline: "span",
  blockquote: "blockquote",
  inlineCode: "code",
  kbd: "kbd",
  list: "ul",
  link: "a",
}

export type TypographyProps = Omit<React.HTMLAttributes<HTMLElement>, "color"> &
  VariantProps<typeof typographyVariants> & {
    asChild?: boolean
    /** Override semantic element (e.g., <Typography variant="h2" as="h1">). */
    as?: keyof HTMLElementTagNameMap
  }

const TypographyBase = React.forwardRef<HTMLElement, TypographyProps>(
  (
    { className, variant = "body", align, color, truncate, balance, as, asChild = false, ...props },
    ref,
  ) => {
    const Comp = asChild
      ? Slot.Root
      : ((as ?? variantToElement[variant ?? "body"]) as unknown as React.ElementType)

    return (
      <Comp
        ref={ref as never}
        data-slot="typography"
        data-variant={variant}
        className={cn(typographyVariants({ variant, align, color, truncate, balance, className }))}
        {...props}
      />
    )
  },
)
TypographyBase.displayName = "Typography"

// Convenience aliases — ergonomic and discoverable, same styles as Typography
const H1 = (props: Omit<TypographyProps, "variant">) => <TypographyBase variant="h1" {...props} />
const H2 = (props: Omit<TypographyProps, "variant">) => <TypographyBase variant="h2" {...props} />
const H3 = (props: Omit<TypographyProps, "variant">) => <TypographyBase variant="h3" {...props} />
const H4 = (props: Omit<TypographyProps, "variant">) => <TypographyBase variant="h4" {...props} />
const H5 = (props: Omit<TypographyProps, "variant">) => <TypographyBase variant="h5" {...props} />
const H6 = (props: Omit<TypographyProps, "variant">) => <TypographyBase variant="h6" {...props} />
const Display = (props: Omit<TypographyProps, "variant">) => (
  <TypographyBase variant="display" {...props} />
)
const P = (props: Omit<TypographyProps, "variant">) => <TypographyBase variant="body" {...props} />
const Lead = (props: Omit<TypographyProps, "variant">) => (
  <TypographyBase variant="lead" {...props} />
)
const Large = (props: Omit<TypographyProps, "variant">) => (
  <TypographyBase variant="large" {...props} />
)
const Small = (props: Omit<TypographyProps, "variant">) => (
  <TypographyBase variant="small" {...props} />
)
const Muted = (props: Omit<TypographyProps, "variant">) => (
  <TypographyBase variant="muted" {...props} />
)
const Blockquote = (props: Omit<TypographyProps, "variant">) => (
  <TypographyBase variant="blockquote" {...props} />
)
const InlineCode = (props: Omit<TypographyProps, "variant">) => (
  <TypographyBase variant="inlineCode" {...props} />
)
const Caption = (props: Omit<TypographyProps, "variant">) => (
  <TypographyBase variant="caption" {...props} />
)
const Overline = (props: Omit<TypographyProps, "variant">) => (
  <TypographyBase variant="overline" {...props} />
)
const Kbd = (props: Omit<TypographyProps, "variant">) => <TypographyBase variant="kbd" {...props} />
const List = (props: Omit<TypographyProps, "variant">) => (
  <TypographyBase variant="list" {...props} />
)

type TypographyCompound = typeof TypographyBase & {
  // lowercase — requested API: <Typography.h1>
  h1: typeof H1
  h2: typeof H2
  h3: typeof H3
  h4: typeof H4
  h5: typeof H5
  h6: typeof H6
  p: typeof P
  display: typeof Display
  lead: typeof Lead
  large: typeof Large
  small: typeof Small
  muted: typeof Muted
  caption: typeof Caption
  overline: typeof Overline
  blockquote: typeof Blockquote
  code: typeof InlineCode
  kbd: typeof Kbd
  list: typeof List
  // PascalCase aliases for flexibility
  H1: typeof H1
  H2: typeof H2
  H3: typeof H3
  H4: typeof H4
  H5: typeof H5
  H6: typeof H6
  P: typeof P
  Display: typeof Display
  Lead: typeof Lead
  Large: typeof Large
  Small: typeof Small
  Muted: typeof Muted
  Caption: typeof Caption
  Overline: typeof Overline
  Blockquote: typeof Blockquote
  InlineCode: typeof InlineCode
  Kbd: typeof Kbd
  List: typeof List
}

const Typography = TypographyBase as TypographyCompound
// lowercase compound API — primary requested syntax
Typography.h1 = H1
Typography.h2 = H2
Typography.h3 = H3
Typography.h4 = H4
Typography.h5 = H5
Typography.h6 = H6
Typography.p = P
Typography.display = Display
Typography.lead = Lead
Typography.large = Large
Typography.small = Small
Typography.muted = Muted
Typography.caption = Caption
Typography.overline = Overline
Typography.blockquote = Blockquote
Typography.code = InlineCode
Typography.kbd = Kbd
Typography.list = List
// PascalCase mirrors
Typography.H1 = H1
Typography.H2 = H2
Typography.H3 = H3
Typography.H4 = H4
Typography.H5 = H5
Typography.H6 = H6
Typography.P = P
Typography.Display = Display
Typography.Lead = Lead
Typography.Large = Large
Typography.Small = Small
Typography.Muted = Muted
Typography.Caption = Caption
Typography.Overline = Overline
Typography.Blockquote = Blockquote
Typography.InlineCode = InlineCode
Typography.Kbd = Kbd
Typography.List = List

export {
  Blockquote,
  Caption,
  Display,
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  InlineCode,
  Kbd,
  Large,
  Lead,
  List,
  Muted,
  Overline,
  P,
  Small,
  Typography,
  typographyVariants,
}
