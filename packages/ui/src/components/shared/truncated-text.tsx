import {
  Tooltip,
  TooltipContent,
  type TooltipPlacement,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/design/tooltip"
import { cn } from "@workspace/ui/lib/utils"
import * as React from "react"

export interface TruncatedTextProps extends React.HTMLAttributes<HTMLElement> {
  /** The text content to display and truncate. */
  text?: string
  /** Custom content to render inside the tooltip (defaults to `text` or `children`). */
  tooltipContent?: React.ReactNode
  /** Maximum number of visible lines before truncating. Default: 1 (single-line ellipsis). */
  maxLines?: number
  /** Placement of the tooltip. Default: 'top'. */
  placement?: TooltipPlacement
  /** Hover delay in milliseconds before showing tooltip. Default: 200. */
  delayDuration?: number
  /** If true, the tooltip will only open when text is actually overflowing/truncated. Default: true. */
  onlyShowWhenTruncated?: boolean
  /** Disable the tooltip entirely. */
  disabled?: boolean
  /** HTML Tag or Component to render as. Default: 'span'. */
  as?: React.ElementType
}

const TruncatedText = React.forwardRef<HTMLElement, TruncatedTextProps>(
  (
    {
      text,
      children,
      tooltipContent,
      maxLines = 1,
      placement = "top",
      delayDuration = 200,
      onlyShowWhenTruncated = true,
      disabled = false,
      as: Comp = "span",
      className,
      onMouseEnter,
      ...props
    },
    forwardedRef,
  ) => {
    const internalRef = React.useRef<HTMLElement | null>(null)
    const [isTruncated, setIsTruncated] = React.useState(false)

    const checkTruncation = React.useCallback(() => {
      const el = internalRef.current
      if (!el) return
      // Check horizontal or vertical overflow (with 1px tolerance for rounding)
      const overflowed =
        el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1
      setIsTruncated(overflowed)
    }, [])

    const handleRef = React.useCallback(
      (node: HTMLElement | null) => {
        internalRef.current = node
        if (typeof forwardedRef === "function") {
          forwardedRef(node)
        } else if (forwardedRef) {
          ;(forwardedRef as React.MutableRefObject<HTMLElement | null>).current = node
        }
      },
      [forwardedRef],
    )

    React.useEffect(() => {
      checkTruncation()

      const el = internalRef.current
      if (!el || typeof ResizeObserver === "undefined") return

      const observer = new ResizeObserver(() => {
        checkTruncation()
      })
      observer.observe(el)
      return () => observer.disconnect()
    }, [checkTruncation])

    const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
      checkTruncation()
      onMouseEnter?.(e)
    }

    const contentToDisplay = text ?? children
    const resolvedTooltipContent = tooltipContent ?? contentToDisplay

    const lineClampStyle =
      maxLines > 1
        ? {
            display: "-webkit-box",
            WebkitLineClamp: maxLines,
            WebkitBoxOrient: "orient-vertical" as const,
            overflow: "hidden",
          }
        : undefined

    const lineClampClass = maxLines === 1 ? "truncate block" : maxLines > 1 ? "overflow-hidden" : ""

    const isTooltipEnabled = !disabled && (onlyShowWhenTruncated ? isTruncated : true)

    const elementNode = (
      <Comp
        ref={handleRef}
        className={cn(lineClampClass, className)}
        style={lineClampStyle}
        onMouseEnter={handleMouseEnter}
        {...props}
      >
        {contentToDisplay}
      </Comp>
    )

    if (!isTooltipEnabled || !resolvedTooltipContent) {
      return elementNode
    }

    return (
      <TooltipProvider delayDuration={delayDuration}>
        <Tooltip>
          <TooltipTrigger asChild>{elementNode}</TooltipTrigger>
          <TooltipContent placement={placement}>{resolvedTooltipContent}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  },
)

TruncatedText.displayName = "TruncatedText"

export { TruncatedText }
