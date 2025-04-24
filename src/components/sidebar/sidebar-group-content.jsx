import * as React from "react"
import { cn } from "@/lib/utils"

const SidebarGroupContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("space-y-1 px-2", className)}
    {...props}
  >
    {children}
  </div>
))
SidebarGroupContent.displayName = "SidebarGroupContent"

export { SidebarGroupContent } 