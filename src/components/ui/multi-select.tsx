"use client"

import * as React from "react"
import { Check, ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react"
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
  const [showScrollUpButton, setShowScrollUpButton] = React.useState(false)
  const [showScrollDownButton, setShowScrollDownButton] = React.useState(false)

  const selectedLabels = selected.map((s) => options.find((o) => o.value === s)?.label || "")

  const updateScrollButtonsVisibility = React.useCallback(() => {
    const scrollArea = scrollAreaRef.current
    if (scrollArea) {
      setShowScrollUpButton(scrollArea.scrollTop > 0)
      setShowScrollDownButton(scrollArea.scrollHeight - scrollArea.scrollTop > scrollArea.clientHeight)
    }
  }, [])

  React.useEffect(() => {
    const scrollArea = scrollAreaRef.current
    if (scrollArea) {
      scrollArea.addEventListener("scroll", updateScrollButtonsVisibility)
      updateScrollButtonsVisibility()
    }

    return () => {
      if (scrollArea) {
        scrollArea.removeEventListener("scroll", updateScrollButtonsVisibility)
      }
    }
  }, [updateScrollButtonsVisibility])

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const scrollArea = scrollAreaRef.current
    if (scrollArea) {
      e.preventDefault()
      scrollArea.scrollTop += e.deltaY
    }
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0]
    const scrollArea = scrollAreaRef.current
    if (scrollArea) {
      scrollArea.dataset.touchStartY = touch.clientY.toString()
      scrollArea.dataset.touchStartScrollTop = scrollArea.scrollTop.toString()
    }
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0]
    const scrollArea = scrollAreaRef.current
    if (scrollArea && scrollArea.dataset.touchStartY && scrollArea.dataset.touchStartScrollTop) {
      const deltaY = Number.parseInt(scrollArea.dataset.touchStartY) - touch.clientY
      scrollArea.scrollTop = Number.parseInt(scrollArea.dataset.touchStartScrollTop) + deltaY
      e.preventDefault()
    }
  }

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
          {showScrollUpButton && (
            <div
              className="flex items-center justify-center h-7 bg-white z-10 cursor-pointer"
            >
              <ChevronUp className="h-4 w-4" />
            </div>
          )}
          <div className="relative">
            <div
              ref={scrollAreaRef}
              className="max-h-[200px] overflow-auto"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(155, 155, 155, 0.5) transparent",
              }}
              onWheel={handleWheel}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
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
                        updateScrollButtonsVisibility()
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
          </div>
          {showScrollDownButton && (
            <div
              className="flex items-center justify-center h-7 bg-white z-10 cursor-pointer"
            >
              <ChevronDown className="h-4 w-4" />
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  )
}

