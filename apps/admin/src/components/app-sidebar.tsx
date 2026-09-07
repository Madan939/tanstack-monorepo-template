import { Link, useRouterState } from "@tanstack/react-router"
import { Button } from "@workspace/ui/components/design/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/design/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@workspace/ui/components/design/tooltip"
import { Icon } from "@workspace/ui/components/shared/icon"
import { cn } from "@workspace/ui/lib/utils"
import type { SessionUser } from "#/lib/session"
import * as React from "react"

type NavItem = {
  label: string
  icon: string
  to: string
  matchPath?: string
}

const NAV_ITEMS: { UPPER: NavItem[]; LOWER: NavItem[] } = {
  UPPER: [
    { label: "Dashboard", icon: "dashboard", to: "/" },
    { label: "Dashboard (alt)", icon: "home", to: "/dashboard" },
  ],
  LOWER: [{ label: "Settings", icon: "settings", to: "/settings" }],
}

function isActive(pathname: string, item: NavItem) {
  const activePath = item.matchPath ?? item.to
  if (activePath === "/") return pathname === "/"
  return pathname === activePath || pathname.startsWith(`${activePath}/`)
}

// Portal-style sidebar – same structure as chatboq-frontend/apps/portal/src/components/shared/sidebar
// but without floating hover panel (no isFloating/hovered). Uses design tokens (sidebar) not portal's gray.

const SIDEBAR_WIDTH = "16rem" // 256px portal: 220px
const SIDEBAR_WIDTH_ICON = "3rem" // 48px portal: 68px
const SIDEBAR_COOKIE_NAME = "admin_sidebar_state"

export function AppSidebar({ user, onLogout, onLogoutAll, isLoggingOut, collapsed, onToggle }: { user: SessionUser; onLogout: () => void; onLogoutAll: () => void; isLoggingOut: boolean; collapsed: boolean; onToggle: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isMobile = useIsMobile()
  const [openMobile, setOpenMobile] = React.useState(false)

  // Mobile drawer – same as portal's Sheet but simplified
  if (isMobile) {
    return (
      <>
        {openMobile && <div className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-[2px] md:hidden" onClick={() => setOpenMobile(false)} aria-hidden />}
        <aside
          data-state={collapsed ? "collapsed" : "expanded"}
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex h-svh w-[16rem] flex-col border-r bg-sidebar text-sidebar-foreground transition-transform duration-200 md:hidden",
            openMobile ? "translate-x-0" : "-translate-x-full",
          )}
          style={{ width: SIDEBAR_WIDTH } as React.CSSProperties}
        >
          <SidebarHeader user={user} collapsed={false} onToggle={() => setOpenMobile(false)} showClose />
          <SidebarNav pathname={pathname} collapsed={false} />
          <SidebarFooter user={user} collapsed={false} onLogout={onLogout} onLogoutAll={onLogoutAll} isLoggingOut={isLoggingOut} />
        </aside>
        {/* Mobile trigger is in AuthenticatedShell header */}
      </>
    )
  }

  return (
    <aside
      data-state={collapsed ? "collapsed" : "expanded"}
      data-collapsible={collapsed ? "icon" : ""}
      className={cn("hidden md:flex h-svh shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-linear", collapsed ? "w-[3rem]" : "w-[16rem]")}
      style={{ width: collapsed ? SIDEBAR_WIDTH_ICON : SIDEBAR_WIDTH } as React.CSSProperties}
    >
      <SidebarHeader user={user} collapsed={collapsed} onToggle={onToggle} />
      <SidebarNav pathname={pathname} collapsed={collapsed} />
      <SidebarFooter user={user} collapsed={collapsed} onLogout={onLogout} onLogoutAll={onLogoutAll} isLoggingOut={isLoggingOut} />
    </aside>
  )
}

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = React.useState(false)
  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const onChange = () => setIsMobile(window.innerWidth < breakpoint)
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < breakpoint)
    return () => mql.removeEventListener("change", onChange)
  }, [breakpoint])
  return isMobile
}

function SidebarHeader({ user: _user, collapsed, onToggle, showClose }: { user: SessionUser; collapsed: boolean; onToggle: () => void; showClose?: boolean }) {
  const expandButton = (
    <button
      onClick={onToggle}
      className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      aria-label="Expand sidebar"
    >
      <span className="flex group-hover/header:hidden">
        <Icon name="dashboard" size={16} aria-hidden decorative />
      </span>
      <span className="hidden group-hover/header:flex">
        <Icon name="panel-left" size={14} aria-hidden decorative />
      </span>
    </button>
  )
  return (
    <div className={cn("group/header flex h-12 shrink-0 items-center border-b border-sidebar-border", collapsed ? "w-full justify-center p-1.75" : "gap-2 px-1.75")}>
      {collapsed ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{expandButton}</TooltipTrigger>
            <TooltipContent side="right" align="center">
              Expand sidebar
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <>
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Icon name="dashboard" size={16} aria-hidden decorative />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Admin Panel</span>
            <span className="truncate text-xs text-muted-foreground">Enterprise</span>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm" onClick={onToggle} className="ml-auto size-7 shrink-0" aria-label="Collapse sidebar">
                  <Icon name="panel-left" size={14} aria-hidden decorative />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" align="center">
                Collapse sidebar
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </>
      )}
      {showClose && (
        <Button variant="ghost" size="icon-sm" onClick={onToggle} className="ml-auto size-7" aria-label="Close">
          <Icon name="close" size={14} aria-hidden decorative />
        </Button>
      )}
    </div>
  )
}

function SidebarNav({ pathname, collapsed }: { pathname: string; collapsed: boolean }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto p-2">
      <div className="flex flex-col gap-1">
        <span className={cn("px-1.75 text-xs font-semibold tracking-wider text-sidebar-foreground/70 uppercase", collapsed && "sr-only")}>Overview</span>
        <nav className="flex flex-col gap-0.5">
          {NAV_ITEMS.UPPER.map((item) => (
            <NavLink key={item.label} item={item} pathname={pathname} collapsed={collapsed} />
          ))}
        </nav>
      </div>
      <div className="flex flex-col gap-1">
        <span className={cn("px-1.75 text-xs font-semibold tracking-wider text-sidebar-foreground/70 uppercase", collapsed && "sr-only")}>System</span>
        <nav className="flex flex-col gap-0.5">
          {NAV_ITEMS.LOWER.map((item) => (
            <NavLink key={item.label} item={item} pathname={pathname} collapsed={collapsed} />
          ))}
        </nav>
      </div>
    </div>
  )
}

function SidebarFooter({ user, collapsed, onLogout, onLogoutAll, isLoggingOut }: { user: SessionUser; collapsed: boolean; onLogout: () => void; onLogoutAll: () => void; isLoggingOut: boolean }) {
  const userButton = (
    <button
      className={cn(
        "flex w-full items-center gap-2 rounded-md border bg-card p-2 text-left transition-colors hover:bg-accent hover:text-accent-foreground",
        collapsed && "w-8 h-8 p-0 gap-0 items-center justify-center mx-auto border-transparent bg-transparent hover:bg-accent",
      )}
      aria-label="User menu"
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon name="user" size={14} aria-hidden decorative />
      </div>
      <div className={cn("grid flex-1 text-left text-sm leading-tight", collapsed && "hidden")}>
        <span className="truncate font-medium text-xs">{user.fullName || "User"}</span>
        <span className="truncate text-[11px] text-muted-foreground">{user.email}</span>
      </div>
      <Icon name="chevron-arrow-right" size={12} aria-hidden decorative className={cn("ml-auto shrink-0 text-muted-foreground", collapsed && "hidden")} />
    </button>
  )
  return (
    <div className="flex flex-col gap-2 p-2 border-t border-sidebar-border">
      <DropdownMenu>
        {collapsed ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>{userButton}</DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="right" align="center">
                {user.fullName || user.email}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <DropdownMenuTrigger asChild>{userButton}</DropdownMenuTrigger>
        )}
        <DropdownMenuContent side={collapsed ? "right" : "top"} align={collapsed ? "start" : "end"} className="w-56">
          <div className="flex items-center gap-2 p-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-muted">
              <Icon name="user" size={14} aria-hidden decorative />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium text-xs">{user.fullName || "User"}</span>
              <span className="truncate text-xs text-muted-foreground">{user.email}</span>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onLogout} disabled={isLoggingOut} className="gap-2">
            <Icon name="arrow-right" size={14} aria-hidden decorative />
            <span>{isLoggingOut ? "Signing out..." : "Log out"}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onLogoutAll} disabled={isLoggingOut} className="gap-2">
            <Icon name="trash" size={14} aria-hidden decorative />
            <span>Log out everywhere</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function NavLink({ item, pathname, collapsed }: { item: NavItem; pathname: string; collapsed: boolean }) {
  const active = isActive(pathname, item)
  const link = (
    <Link
      to={item.to}
      className={cn(
        "rounded-md flex text-sm transition-colors",
        collapsed ? "w-8 h-8 p-0 gap-0 items-center justify-center mx-auto" : "w-full h-8 items-center gap-3 px-2.5",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        active && "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
      )}
    >
      <Icon name={item.icon as never} size={collapsed ? 18 : 16} aria-hidden decorative className="shrink-0" />
      <span className={cn("truncate", collapsed && "hidden")}>{item.label}</span>
    </Link>
  )
  if (!collapsed) return link
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right" align="center">
          {item.label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function AuthenticatedShell({ user, onLogout, onLogoutAll, isLoggingOut, children }: { user: SessionUser; onLogout: () => void; onLogoutAll: () => void; isLoggingOut: boolean; children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(() => {
    if (typeof document === "undefined") return false
    const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${SIDEBAR_COOKIE_NAME}=([^;]*)`))
    return m ? m[1] === "collapsed" : false
  })
  const setCollapsedState = React.useCallback((v: boolean | ((c: boolean) => boolean)) => {
    const next = typeof v === "function" ? (v as (b: boolean) => boolean)(collapsed) : v
    setCollapsed(next)
    document.cookie = `${SIDEBAR_COOKIE_NAME}=${next ? "collapsed" : "expanded"}; path=/; max-age=${60 * 60 * 24 * 7}`
  }, [collapsed])
  const toggle = React.useCallback(() => setCollapsedState((c) => !c), [setCollapsedState])
  const isMobile = useIsMobile()

  return (
    <div className="flex min-h-svh w-full bg-background">
      <AppSidebar user={user} onLogout={onLogout} onLogoutAll={onLogoutAll} isLoggingOut={isLoggingOut} collapsed={collapsed} onToggle={toggle} />
      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 border-b bg-background px-4">
          {isMobile && (
            <Button variant="ghost" size="icon-sm" onClick={toggle} className="size-7 shrink-0 md:hidden" aria-label="Toggle sidebar">
              <Icon name="menu" size={16} aria-hidden decorative />
            </Button>
          )}
          <span className="font-medium text-sm truncate">Admin Dashboard</span>
          <div className="ml-auto hidden sm:flex items-center gap-2 text-xs text-muted-foreground truncate max-w-[200px]">{user.email}</div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 bg-muted/20 overflow-auto">{children}</div>
      </div>
    </div>
  )
}
