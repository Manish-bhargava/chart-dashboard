import React, { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Badge } from "../ui/badge"
import { Checkbox } from "../ui/checkbox"
import { ChevronDown } from "lucide-react"

export function SimpleMultiSelect({
  options = [],
  value = [],
  onChange,
  placeholder = "Select...",
  showCheckAll = false,
  className = "",
  isOpen = false,
  onOpenChange,
  valueCheck = null,
}) {
  const [selectedValues, setSelectedValues] = useState(value)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    setSelectedValues(value)
  }, [value])

  const isValueSelected = (optionValue) => {
    if (valueCheck && typeof valueCheck === 'function') {
      return selectedValues.some(selectedValue => valueCheck(selectedValue, optionValue));
    }
    return selectedValues.includes(optionValue);
  }

  const handleSelect = (optionValue) => {
    let newValues
    if (isValueSelected(optionValue)) {
      newValues = selectedValues.filter(v => !valueCheck ? v !== optionValue : !valueCheck(v, optionValue))
    } else {
      newValues = [...selectedValues, optionValue]
    }
    setSelectedValues(newValues)
    onChange(newValues)
  }

  const handleSelectAll = () => {
    if (selectedValues.length === options.length) {
      setSelectedValues([])
      onChange([])
    } else {
      const allValues = options.map(option => option.value)
      setSelectedValues(allValues)
      onChange(allValues)
    }
  }

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="relative">
      <Button
        variant="outline"
        className={`w-full justify-between ${!selectedValues.length ? 'text-muted-foreground' : ''} ${className}`}
        onClick={() => onOpenChange(!isOpen)}
      >
        {selectedValues.length > 0
          ? `${selectedValues.length} selected`
          : placeholder}
        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
      
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-lg">
          <div className="p-2">
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-2"
            />
            
            {showCheckAll && (
              <div 
                className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded-md cursor-pointer"
                onClick={handleSelectAll}
              >
                <div className="flex h-4 w-4 items-center justify-center mr-2">
                  <Checkbox 
                    id="checkbox-select-all"
                    checked={selectedValues.length > 0 && options.every(option => isValueSelected(option.value))}
                    className="data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                    onCheckedChange={handleSelectAll}
                  />
                </div>
                <span>Select All</span>
              </div>
            )}
            
            <div className="max-h-[200px] overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-2 py-1.5 text-gray-500">
                  No results found.
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <div 
                    key={option.value}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded-md cursor-pointer"
                    onClick={() => handleSelect(option.value)}
                  >
                    <div className="flex h-4 w-4 items-center justify-center mr-2">
                      <Checkbox 
                        id={`checkbox-${option.value}`}
                        checked={isValueSelected(option.value)}
                        className="data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                        onCheckedChange={() => handleSelect(option.value)}
                      />
                    </div>
                    <span>{option.label}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 