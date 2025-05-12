import * as React from "react"
import { cn } from "../../lib/utils"
import { useSidebar } from "./sidebar-provider"

const Sidebar = React.forwardRef(({ className, children, ...props }, ref) => {
  const { isOpen } = useSidebar()

  return (
    <aside
      ref={ref}
      className={cn(
        "fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background",
        "transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0 lg:static",
        className
      )}
      {...props}
    >
      {children}
    </aside>
  )
})
Sidebar.displayName = "Sidebar"

export { Sidebar }

export function SidebarHeader({ className, children }) {
  return <div className={cn("flex-none", className)}>{children}</div>
}

export function SidebarContent({ className, children }) {
  return <div className={cn("flex-1 overflow-y-auto", className)}>{children}</div>
}

export function SidebarFooter({ className, children }) {
  return <div className={cn("flex-none", className)}>{children}</div>
}

export function SidebarTrigger({ className }) {
  const { isOpen, setIsOpen } = useSidebar()

  return (
    <button
      className={cn("p-2 hover:bg-gray-100 rounded-md", className)}
      onClick={() => setIsOpen(!isOpen)}
      aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
    >
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  )
} 