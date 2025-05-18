import * as React from "react"
import { cn } from "@/lib/utils"

const SidebarGroupLabel = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-4 py-1 text-sm font-medium text-muted-foreground", className)}
    {...props}
  >
    {children}
  </div>
))
SidebarGroupLabel.displayName = "SidebarGroupLabel"

export { SidebarGroupLabel } 