import React, { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Badge } from "../ui/badge"
import { Checkbox } from "../ui/checkbox"
import { ChevronDown } from "lucide-react"

export function SimpleMultiSelect({
  options, // Expecting array of {value, label}
  value: propValue, // Expecting array of selected IDs
  onChange, // Should receive array of selected IDs
  placeholder,
  showCheckAll = false,
  label,
  className,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  // Ensure 'value' is always an array of IDs
  const value = Array.isArray(propValue) ? propValue : [];

  // Ensure options is always an array of {value, label} objects
  const currentOptions = Array.isArray(options) ? options : [];
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(currentOptions);

  // Update filteredOptions when options prop changes
  useEffect(() => {
    setFilteredOptions(currentOptions);
  }, [options]);

  // Filter options based on search query
  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      // Filter based on label
      const filtered = currentOptions.filter(option =>
        option.label.toLowerCase().trim().includes(query)
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(currentOptions);
    }
  }, [searchQuery, currentOptions]);

  // Handle selecting/deselecting a single option (using IDs)
  const handleSelect = (optionValueToToggle) => {
    let newValue;
    if (value.includes(optionValueToToggle)) {
      // Remove ID
      newValue = value.filter(itemValue => itemValue !== optionValueToToggle);
    } else {
      // Add ID
      newValue = [...value, optionValueToToggle];
    }
    // Call the parent's onChange with the new array of selected IDs
    onChange(newValue);
  };

  // Handle select/deselect all options (using IDs)
  const handleCheckAll = () => {
    if (value.length === currentOptions.length) {
      onChange([]); // Deselect all: pass empty ID array
    } else {
      // Select all: pass array of all option values (IDs)
      onChange(currentOptions.map(opt => opt.value));
    }
  };

  // Find the full option objects for selected IDs to get labels
  const selectedOptionObjects = currentOptions.filter(opt => value.includes(opt.value));

  return (
    <div className={className}>
       {label && <label className="mb-1 block text-sm font-medium">{label}</label>}
      <Button
        variant="outline"
        className="w-full justify-between h-9 px-3"
        onClick={() => setOpen(!open)}
        disabled={disabled}
      >
        {/* Display selected labels */} 
        {selectedOptionObjects.length > 0 ? (
          <div className="flex flex-wrap gap-1 max-w-[90%] overflow-hidden">
            {selectedOptionObjects.length <= 2 ? (
              selectedOptionObjects.map((item) => (
                <Badge key={item.value} variant="secondary" className="mr-1 text-xs py-0">
                  {item.label}
                </Badge>
              ))
            ) : (
              <>
                <Badge variant="secondary" className="mr-1 text-xs py-0">
                  {selectedOptionObjects[0].label}
                </Badge>
                <Badge variant="secondary" className="text-xs py-0">+{value.length - 1} more</Badge>
              </>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">{placeholder}</span>
        )}
        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-1.5 shadow-lg">
          <Input
            placeholder={`Search ${placeholder.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-1.5 h-8 text-sm"
          />
          
          {showCheckAll && (
            <div 
              className="flex items-center gap-2 px-2 py-1.5 hover:bg-accent rounded-md cursor-pointer"
              onClick={handleCheckAll}
            >
              <Checkbox 
                checked={value.length === currentOptions.length} 
                id="select-all"
                className="h-4 w-4"
              />
              <span className="font-medium text-sm">
                {value.length === currentOptions.length ? "Unselect All" : "Select All"}
              </span>
            </div>
          )}
          
          <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {filteredOptions.length === 0 ? (
              <div className="p-2 text-sm text-muted-foreground">
                No {placeholder.toLowerCase()} found.
              </div>
            ) : (
              filteredOptions.map((option) => {
                return (
                  <div 
                    key={option.value}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-accent rounded-md cursor-pointer"
                    onClick={() => handleSelect(option.value)} // Pass the ID to handleSelect
                  >
                    <Checkbox 
                      checked={value.includes(option.value)} // Check based on ID
                      id={option.value}
                      className="h-4 w-4"
                    />
                    <span className="text-sm truncate">{option.label}</span> {/* Render the label string */}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
} 