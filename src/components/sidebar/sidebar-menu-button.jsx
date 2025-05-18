import * as React from "react"
import { cn } from "@/lib/utils"

const SidebarMenuButton = React.forwardRef(({ className, isActive, children, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
      isActive && "bg-accent text-accent-foreground",
      className
    )}
    {...props}
  >
    {children}
  </button>
))
SidebarMenuButton.displayName = "SidebarMenuButton"

export { SidebarMenuButton } 