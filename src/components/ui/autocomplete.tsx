import * as React from "react"
import { ChevronDown, Check, X } from "lucide-react"
import { cn } from "../../lib/utils"

interface AutocompleteProps {
  value: string
  onValueChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
  className?: string
  disabled?: boolean
  searchable?: boolean
}

export const Autocomplete = React.forwardRef<HTMLDivElement, AutocompleteProps>(
  ({ value, onValueChange, options, placeholder = "Select...", className, disabled, searchable = true }, _ref) => {
    const [open, setOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    const inputRef = React.useRef<HTMLInputElement>(null)
    const containerRef = React.useRef<HTMLDivElement>(null)

    const selectedOption = options.find(opt => opt.value === value)

    const filteredOptions = React.useMemo(() => {
      if (!searchQuery) return options
      const query = searchQuery.toLowerCase()
      return options.filter(opt => 
        opt.label.toLowerCase().includes(query) || 
        opt.value.toLowerCase().includes(query)
      )
    }, [options, searchQuery])

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setOpen(false)
          setSearchQuery("")
        }
      }

      if (open) {
        document.addEventListener("mousedown", handleClickOutside)
        setTimeout(() => inputRef.current?.focus(), 0)
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }, [open])

    const handleSelect = (optionValue: string) => {
      onValueChange(optionValue)
      setOpen(false)
      setSearchQuery("")
    }

    const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        if (!disabled) setOpen((prev) => !prev)
      }
    }

    return (
      <div ref={containerRef} className={cn("relative w-full", className)}>
        <div
          role="combobox"
          tabIndex={disabled ? undefined : 0}
          aria-expanded={open}
          aria-haspopup="listbox"
          onClick={() => !disabled && setOpen(!open)}
          onKeyDown={handleTriggerKeyDown}
          className={cn(
            "flex h-11 w-full items-center justify-between rounded-xl border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-[#111827] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#22C55E] dark:focus:ring-green-500 cursor-pointer",
            disabled && "cursor-not-allowed opacity-50 pointer-events-none",
            open && "ring-2 ring-[#22C55E] dark:ring-green-500"
          )}
        >
          <span className={cn("flex-1 text-left", !selectedOption && "text-gray-400 dark:text-gray-500")}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            {value && !disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onValueChange("")
                  setSearchQuery("")
                }}
                className="rounded-full p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Clear selection"
              >
                <X className="h-3 w-3" />
              </button>
            )}
            <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform", open && "rotate-180")} />
          </div>
        </div>

        {open && (
          <div className="absolute z-[100] mt-1 w-full max-h-64 overflow-auto rounded-xl border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg hide-scrollbar">
            {searchable && (
              <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-[#E5E7EB] dark:border-gray-700 p-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-[#111827] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#22C55E] dark:focus:ring-green-500"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
            <div className="p-1">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = value === option.value
                  return (
                    <div
                      key={option.value}
                      onClick={() => handleSelect(option.value)}
                      className={cn(
                        "relative flex w-full cursor-pointer select-none items-center rounded-lg py-2.5 pl-8 pr-2 text-sm outline-none hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 transition-colors",
                        isSelected && "bg-gray-100 dark:bg-gray-700"
                      )}
                    >
                      {isSelected && (
                        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                          <Check className="h-4 w-4 text-[#22C55E] dark:text-green-400" />
                        </span>
                      )}
                      <span className={cn(isSelected && "font-medium")}>{option.label}</span>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>
    )
  }
)
Autocomplete.displayName = "Autocomplete"


