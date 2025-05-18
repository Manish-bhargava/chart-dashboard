import * as React from "react"
import PropTypes from "prop-types"

const SidebarContext = React.createContext()

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

export function SidebarProvider({ children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  const value = React.useMemo(() => ({ isOpen, setIsOpen }), [isOpen])

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  )
}

SidebarProvider.propTypes = {
  children: PropTypes.node.isRequired,
  defaultOpen: PropTypes.bool
} 