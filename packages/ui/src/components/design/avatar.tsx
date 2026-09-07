import { cn } from "@workspace/ui/lib/utils"
import { Avatar as AvatarPrimitive } from "radix-ui"
import * as React from "react"

import { type IconName } from "@workspace/ui/components/icons/registry"
import { Icon } from "@workspace/ui/components/shared/icon"

export type AvatarSize = "xs" | "sm" | "md" | "default" | "lg" | "xl" | "2xl"
type AvatarFallbackType = "text" | "icon"

interface AvatarGroupContextValue { size: AvatarSize }
const AvatarGroupContext = React.createContext<AvatarGroupContextValue>({ size: "default" })

const avatarConfig: Record<AvatarSize, { size: string; text: string; icon: number; badge: string }> = {
  xs: { size: "size-6", text: "text-[10px] leading-none", icon: 12, badge: "size-2" },
  sm: { size: "size-8", text: "text-xs leading-none", icon: 14, badge: "size-2.5" },
  default: { size: "size-9", text: "text-sm leading-none", icon: 16, badge: "size-2.5" },
  md: { size: "size-10", text: "text-sm leading-none", icon: 16, badge: "size-3" },
  lg: { size: "size-11", text: "text-base leading-none", icon: 18, badge: "size-3" },
  xl: { size: "size-14", text: "text-lg leading-none", icon: 20, badge: "size-3.5" },
  "2xl": { size: "size-16", text: "text-xl leading-none", icon: 24, badge: "size-4" },
}

const getInitials = (text?: string) =>
  text
    ?.trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || ""

function AvatarGroup({
  className,
  size = "default",
  max,
  ringClassName = "ring-background",
  children,
  ...props
}: React.ComponentProps<"div"> & { size?: AvatarSize; max?: number; ringClassName?: string }) {
  const childArray = React.Children.toArray(children)
  const visibleChildren = max ? childArray.slice(0, max) : childArray
  const overflowCount = max ? childArray.length - max : 0
  return (
    <AvatarGroupContext.Provider value={{ size }}>
      <div
        data-slot="avatar-group"
        className={cn(
          "flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background",
          ringClassName,
          className,
        )}
        {...props}
      >
        {visibleChildren}
        {overflowCount > 0 && <AvatarGroupCount>+{overflowCount}</AvatarGroupCount>}
      </div>
    </AvatarGroupContext.Provider>
  )
}

function AvatarGroupCount({ className, children, ...props }: React.ComponentProps<"div">) {
  const { size } = React.useContext(AvatarGroupContext)
  const config = avatarConfig[size]
  return (
    <div
      data-slot="avatar-group-count"
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full bg-muted font-medium text-muted-foreground ring-2 ring-background",
        config.size,
        config.text,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface AvatarProps extends Omit<React.ComponentProps<typeof AvatarPrimitive.Root>, "children"> {
  size?: AvatarSize
  image?: string | undefined
  alt?: string
  fallbackText?: string
  fallbackType?: AvatarFallbackType
  iconName?: IconName
  isActive?: boolean
  showAvatarBadge?: boolean
  imageClassName?: string
}

function Avatar({
  size = "default",
  image,
  alt,
  fallbackText,
  fallbackType = "text",
  iconName = "user",
  isActive = false,
  showAvatarBadge = false,
  imageClassName,
  className,
  ...props
}: AvatarProps) {
  const config = avatarConfig[size]
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(
        "group/avatar relative flex shrink-0 select-none overflow-hidden rounded-full bg-muted ring-1 ring-border",
        config.size,
        className,
      )}
      {...props}
    >
      {image ? (
        <AvatarPrimitive.Image
          src={image}
          alt={alt}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className={cn("aspect-square size-full object-cover", imageClassName)}
        />
      ) : (
        <AvatarPrimitive.Fallback
          data-slot="avatar-fallback"
          className={cn("flex size-full items-center justify-center bg-muted text-foreground", config.text)}
        >
          {fallbackType === "icon" ? (
            <Icon name={iconName} size={config.icon} className="text-muted-foreground" aria-hidden decorative />
          ) : (
            <span className={cn("font-medium", config.text)}>{getInitials(fallbackText ?? "User")}</span>
          )}
        </AvatarPrimitive.Fallback>
      )}
      {showAvatarBadge && (
        <span
          className={cn(
            "absolute right-0 bottom-0 z-10 rounded-full ring-2 ring-background",
            isActive ? "bg-primary" : "bg-muted-foreground",
            config.badge,
          )}
        />
      )}
    </AvatarPrimitive.Root>
  )
}

// Legacy simple API for compatibility
function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return <AvatarPrimitive.Image data-slot="avatar-image" className={cn("aspect-square size-full object-cover", className)} {...props} />
}

function AvatarFallback({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn("flex size-full items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground", className)}
      {...props}
    />
  )
}

function AvatarBadge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar-badge"
      className={cn("absolute -right-1 -bottom-1 z-10 inline-flex rounded-full bg-primary ring-2 ring-background", className)}
      {...props}
    />
  )
}

export { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage, AvatarBadge, avatarConfig }
