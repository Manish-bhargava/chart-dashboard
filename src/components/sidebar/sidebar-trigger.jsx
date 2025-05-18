import * as React from "react"
import { Menu } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import { useSidebar } from "./sidebar-provider"

const SidebarTrigger = React.forwardRef(({ className, ...props }, ref) => {
  const { setIsOpen, isOpen } = useSidebar()

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn(
        "fixed left-4 top-4 z-50 lg:hidden",
        "rounded-full bg-background shadow-md hover:bg-accent",
        className
      )}
      onClick={() => setIsOpen(!isOpen)}
      {...props}
    >
      <Menu className="h-5 w-5" />
      <span className="sr-only">{isOpen ? "Close sidebar" : "Open sidebar"}</span>
    </Button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"

export { SidebarTrigger } 