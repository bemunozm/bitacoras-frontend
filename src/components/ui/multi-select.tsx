import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export type Option = {
  label: string
  value: string
}

type MultiSelectProps = {
  options: Option[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
}

export function MultiSelect({ options, selected, onChange, placeholder }: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const scrollAreaRef = React.useRef<HTMLDivElement>(null)

  const selectedLabels = selected.map((s) => options.find((o) => o.value === s)?.label || "")

  React.useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const scrollArea = scrollAreaRef.current
      if (scrollArea) {
        const { scrollTop, scrollHeight, clientHeight } = scrollArea
        const delta = e.deltaY
        const bottomReached = scrollTop + clientHeight >= scrollHeight
        const topReached = scrollTop === 0

        if ((bottomReached && delta > 0) || (topReached && delta < 0)) {
          e.preventDefault()
        } else {
          scrollArea.scrollTop += delta
        }
      }
    }

    const scrollArea = scrollAreaRef.current
    if (scrollArea) {
      scrollArea.addEventListener("wheel", handleWheel, { passive: false })
    }

    return () => {
      if (scrollArea) {
        scrollArea.removeEventListener("wheel", handleWheel)
      }
    }
  }, [])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          <span className="truncate">
            {selectedLabels.length > 0 ? selectedLabels.join(", ") : placeholder || "Seleccionar..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <div
            ref={scrollAreaRef}
            className="max-h-[200px] overflow-auto"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(155, 155, 155, 0.5) transparent",
            }}
            onWheel={(e) => e.stopPropagation()}
          >
            <CommandList>
              <CommandEmpty>No se encontraron resultados.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      onChange(
                        selected.includes(option.value)
                          ? selected.filter((item) => item !== option.value)
                          : [...selected, option.value],
                      )
                    }}
                  >
                    <Check
                      className={cn("mr-2 h-4 w-4", selected.includes(option.value) ? "opacity-100" : "opacity-0")}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

