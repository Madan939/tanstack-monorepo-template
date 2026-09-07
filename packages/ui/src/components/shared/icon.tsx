// components/shared/icon.tsx — WCAG 2.1 AA / WAI-ARIA 1.1 compliant
// - decorative by default (aria-hidden), semantic when aria-label/tooltip provided
// - tooltip via Radix Tooltip (keyboard + hover, ESC dismiss, focus management)
// - RTL-aware: directional icons auto-mirror when dir="rtl" via CSS

import { Tooltip, TooltipContent, TooltipTrigger } from "@workspace/ui/components/design/tooltip"
import { cn } from "@workspace/ui/lib/utils"
import * as React from "react"

import { type IconName, icons } from "../icons"

export interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, "name"> {
  name: IconName
  size?: number | string
  /** Accessible name — when provided, icon is semantic (role="img"). */
  "aria-label"?: string
  /** Force decorative (aria-hidden) even if aria-label present. */
  decorative?: boolean
  /** Tooltip content — when provided, icon is wrapped in Tooltip (keyboard + hover). */
  tooltip?: React.ReactNode
  /** Tooltip side — defaults to "top" (Radix). */
  tooltipSide?: React.ComponentProps<typeof TooltipContent>["side"]
  tooltipAlign?: React.ComponentProps<typeof TooltipContent>["align"]
  tooltipDelayDuration?: number
  /** Mirrored for RTL — auto-applied for directional icons. */
  mirrored?: boolean
}

const RTL_ICONS = new Set<IconName>([
  "arrow-left",
  "arrow-right",
  "chevron-arrow-left",
  "chevron-arrow-right",
  "long-arrow-left",
  "long-arrow-right",
])

const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  (
    {
      name,
      size = 24,
      className,
      "aria-label": ariaLabel,
      decorative,
      tooltip,
      tooltipSide,
      tooltipAlign,
      tooltipDelayDuration,
      mirrored,
      ...props
    },
    ref,
  ) => {
    const Svg = icons[name] as React.ComponentType<React.SVGProps<SVGSVGElement>> | undefined
    if (!Svg) {
      console.warn(`[Icon] Unknown icon name: "${name}"`)
      return null
    }

    const shouldMirror = mirrored ?? RTL_ICONS.has(name)
    const isDecorative = decorative ?? (!ariaLabel && !tooltip)

    const svgNode = (
      <Svg
        ref={ref}
        width={size}
        height={size}
        className={cn(shouldMirror && "[[dir=rtl]_&]:scale-x-[-1]", className)}
        // WAI-ARIA: decorative → aria-hidden, semantic → role="img" + aria-label
        aria-hidden={isDecorative ? true : undefined}
        role={isDecorative ? undefined : "img"}
        aria-label={
          !isDecorative
            ? (ariaLabel ?? (typeof tooltip === "string" ? tooltip : undefined))
            : undefined
        }
        focusable="false"
        {...props}
      />
    )

    if (tooltip) {
      // Tooltip wraps the icon — Radix handles hover + focus + ESC + aria-describedby
      return (
        <Tooltip delayDuration={tooltipDelayDuration ?? 300}>
          <TooltipTrigger asChild>
            {/* span wrapper ensures tooltip works even if SVG is disabled/decorative */}
            <span
              data-slot="icon-trigger"
              tabIndex={isDecorative ? undefined : 0}
              className="inline-flex items-center justify-center outline-none"
            >
              {svgNode}
            </span>
          </TooltipTrigger>
          <TooltipContent side={tooltipSide} align={tooltipAlign}>
            {tooltip}
          </TooltipContent>
        </Tooltip>
      )
    }

    return svgNode
  },
)
Icon.displayName = "Icon"

export { Icon }
