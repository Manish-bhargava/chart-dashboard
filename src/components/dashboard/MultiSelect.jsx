import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown } from "lucide-react";

export function MultiSelect({ options, value, onChange, placeholder, showCheckAll = false }) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);

  // Filter options based on search query
  useEffect(() => {
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const filtered = options.filter((option) =>
        option.toLowerCase().trim().includes(query)
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(options);
    }
  }, [searchQuery, options]);

  // Handle selecting or deselecting an option
  const handleSelect = (option) => {
    if (!option) return;
    
    const newValue = value.includes(option)
      ? value.filter((item) => item !== option) // Remove option
      : [...value, option]; // Add option
    
    onChange(newValue); // Propagate change to parent
  };

  // Handle select/deselect all options
  const handleSelectAll = () => {
    if (value.length === options.length) {
      onChange([]); // Unselect all
    } else {
      onChange([...options]); // Select all
    }
  };

  // Handle search input change
  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between"
          onClick={() => setOpen(true)}
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
      </PopoverTrigger>

      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder={`Search ${placeholder.toLowerCase()}...`}
            value={searchQuery}
            onValueChange={handleSearch}
          />
          <CommandList>
            <CommandEmpty>No {placeholder.toLowerCase()} found.</CommandEmpty>
            <CommandGroup>
              {showCheckAll && (
                <CommandItem
                  onSelect={(e) => {
                    e.preventDefault();
                    handleSelectAll();
                  }}
                  className="flex items-center gap-2"
                >
                  <Checkbox
                    checked={value.length === options.length}
                    onCheckedChange={handleSelectAll}
                    id="select-all"
                  />
                  <span className="font-medium">
                    {value.length === options.length ? "Unselect All" : "Select All"}
                  </span>
                </CommandItem>
              )}
              <ScrollArea className="h-[200px]">
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option}
                    onSelect={(e) => {
                      e.preventDefault();
                      handleSelect(option);
                    }}
                    className="flex items-center gap-2"
                  >
                    <Checkbox
                      checked={value.includes(option)}
                      onCheckedChange={() => handleSelect(option)}
                      id={option}
                    />
                    <span>{option}</span>
                  </CommandItem>
                ))}
              </ScrollArea>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
