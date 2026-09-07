/**
 * Design Tokens — Single source of truth for the @workspace/ui design system
 *
 * Conventions:
 * - Colors use OKLCH via CSS variables (see src/styles/globals.css) for perceptual uniformity and WCAG contrast
 * - Typography uses Noto Sans Variable (body) + Playfair Display Variable (display/headings) for international script coverage
 * - Spacing is 4px base (0.25rem) — see --spacing
 * - Radius uses --radius (0.625rem) but components default to rounded-none for editorial sharpness; use `rounded-[var(--radius)]` when needed
 * - Motion: 150ms for micro-interactions, 200ms for layout
 *
 * International standards:
 * - WCAG 2.1 AA contrast (≥4.5:1 for text, ≥3:1 for large text)
 * - Supports `lang` / `dir` (RTL) via logical properties and Noto Sans' 1000+ glyph coverage
 * - Type scale is fluid and respects user `prefers-reduced-motion` and `prefers-contrast`
 */

export const typography = {
  fontFamily: {
    sans: "var(--font-sans), ui-sans-serif, system-ui, sans-serif",
    display: "var(--font-heading), ui-serif, Georgia, serif",
    mono: "ui-monospace, SFMono-Regular, Menlo, monospace",
  },
  // Tailwind class tokens — used by Typography component
  scale: {
    display: "font-display text-5xl font-bold tracking-tight md:text-6xl",
    h1: "font-display text-4xl font-bold tracking-tight md:text-5xl",
    h2: "font-display text-3xl font-semibold tracking-tight md:text-4xl",
    h3: "font-display text-2xl font-semibold tracking-tight md:text-3xl",
    h4: "text-xl font-semibold tracking-tight",
    h5: "text-lg font-semibold tracking-tight",
    h6: "text-sm font-semibold uppercase tracking-widest",
    lead: "text-muted-foreground text-xl leading-relaxed",
    body: "text-base leading-7",
    "body-sm": "text-sm leading-6",
    large: "text-lg font-semibold",
    small: "text-sm font-medium",
    muted: "text-muted-foreground text-sm",
    caption: "text-muted-foreground text-xs uppercase tracking-widest",
    overline: "text-muted-foreground text-[0.625rem] font-semibold uppercase tracking-widest",
    blockquote: "border-l-2 border-foreground pl-6 italic",
    inlineCode: "bg-muted text-foreground rounded-none px-1.5 py-0.5 font-mono text-sm font-medium",
    kbd: "bg-muted text-muted-foreground rounded-none border px-1.5 py-0.5 font-mono text-xs",
    list: "my-6 ml-6 list-disc [&>li]:mt-2",
  },
} as const

export const colors = {
  background: "var(--background)",
  foreground: "var(--foreground)",
  card: "var(--card)",
  primary: "var(--primary)",
  secondary: "var(--secondary)",
  muted: "var(--muted)",
  accent: "var(--accent)",
  destructive: "var(--destructive)",
  border: "var(--border)",
  input: "var(--input)",
  ring: "var(--ring)",
} as const

export const spacing = {
  xs: "0.25rem",
  sm: "0.5rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "2rem",
  "2xl": "3rem",
} as const

export const radius = {
  none: "0",
  sm: "calc(var(--radius) - 4px)",
  md: "var(--radius)",
  lg: "calc(var(--radius) + 4px)",
  full: "9999px",
} as const
