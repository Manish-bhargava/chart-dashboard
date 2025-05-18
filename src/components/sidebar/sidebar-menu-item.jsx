import * as React from "react"
import { cn } from "@/lib/utils"

const SidebarMenuItem = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground", className)}
    {...props}
  >
    {children}
  </div>
))
SidebarMenuItem.displayName = "SidebarMenuItem"

export { SidebarMenuItem } 