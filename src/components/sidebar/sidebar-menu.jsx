import React from "react"
import { cn } from "@/lib/utils"

export function SidebarGroup({ className, children }) {
  return <div className={cn("space-y-3", className)}>{children}</div>
}

export function SidebarGroupLabel({ className, children }) {
  return <div className={cn("px-4 text-xs font-semibold uppercase text-gray-500", className)}>{children}</div>
}

export function SidebarGroupContent({ className, children }) {
  return <div className={cn("space-y-1", className)}>{children}</div>
}

const SidebarMenu = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("space-y-1", className)}
    {...props}
  >
    {children}
  </div>
))
SidebarMenu.displayName = "SidebarMenu"

export { SidebarMenu }

export function SidebarMenuItem({ className, children }) {
  return <div className={cn("px-3", className)}>{children}</div>
}

export function SidebarMenuButton({ className, isActive, children, ...props }) {
  return (
    <button
      className={cn(
        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-gray-100 text-gray-900"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
} 