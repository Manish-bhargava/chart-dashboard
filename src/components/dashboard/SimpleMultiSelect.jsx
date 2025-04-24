import React, { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Badge } from "../ui/badge"
import { Checkbox } from "../ui/checkbox"
import { ChevronDown } from "lucide-react"

export function SimpleMultiSelect({ options, value, onChange, placeholder, showCheckAll = false }) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredOptions, setFilteredOptions] = useState(options)

  // Filter options based on search query
  useEffect(() => {
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      const filtered = options.filter(option => 
        option.toLowerCase().trim().includes(query)
      )
      setFilteredOptions(filtered)
    } else {
      setFilteredOptions(options)
    }
  }, [searchQuery, options])

  // Handle selecting or deselecting an option
  const handleSelect = (option) => {
    if (!option) return
    
    const newValue = value.includes(option)
      ? value.filter(item => item !== option) // Remove option
      : [...value, option] // Add option
    
    onChange(newValue) // Propagate change to parent
  }

  // Handle select/deselect all options
  const handleSelectAll = () => {
    if (value.length === options.length) {
      onChange([]) // Unselect all
    } else {
      onChange([...options]) // Select all
    }
  }

  return (
    <div className="relative">
      <Button 
        variant="outline" 
        className="w-full justify-between"
        onClick={() => setOpen(!open)}
      >
        {value.length > 0 ? (
          <div className="flex flex-wrap gap-1 max-w-[90%] overflow-hidden">
            {value.length <= 2 ? (
              value.map((item) => (
                <Badge key={item} variant="secondary" className="mr-1">
                  {item}
                </Badge>
              ))
            ) : (
              <>
                <Badge variant="secondary" className="mr-1">
                  {value[0]}
                </Badge>
                <Badge variant="secondary">+{value.length - 1} more</Badge>
              </>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-2 shadow-md">
          <Input
            placeholder={`Search ${placeholder.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-2"
          />
          
          {showCheckAll && (
            <div 
              className="flex items-center gap-2 p-2 hover:bg-accent rounded-md cursor-pointer"
              onClick={handleSelectAll}
            >
              <Checkbox 
                checked={value.length === options.length} 
                id="select-all"
              />
              <span className="font-medium">
                {value.length === options.length ? "Unselect All" : "Select All"}
              </span>
            </div>
          )}
          
          <div className="max-h-[200px] overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-2 text-sm text-muted-foreground">
                No {placeholder.toLowerCase()} found.
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div 
                  key={option}
                  className="flex items-center gap-2 p-2 hover:bg-accent rounded-md cursor-pointer"
                  onClick={() => handleSelect(option)}
                >
                  <Checkbox 
                    checked={value.includes(option)} 
                    id={option}
                  />
                  <span>{option}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
} 