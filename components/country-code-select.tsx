"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { countryCodes } from "@/lib/country-codes"
// Note: The unused 'SupabaseClient' import has been removed.

interface CountryCodeSelectProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function CountryCodeSelect({ value, onValueChange, placeholder, className }: CountryCodeSelectProps) {
  const [open, setOpen] = React.useState(false)

  const selectedCountry = countryCodes.find((country) => country.dialCode === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-[100px] justify-between bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500",
            className,
          )}
        >
          {selectedCountry ? selectedCountry.dialCode : placeholder || "Code"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0 bg-neutral-800 text-neutral-50 border-neutral-700 rounded-lg">
        <Command>
          <CommandInput placeholder="Search country or code..." className="h-12" />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {countryCodes.map((country) => (
                <CommandItem
                  key={country.code}
                  value={`${country.name} ${country.dialCode}`}
                  onSelect={() => {
                    // FIX: Check if country.dialCode exists before calling onValueChange
                    if (country.dialCode) {
                      onValueChange(country.dialCode)
                    }
                    setOpen(false)
                  }}
                  className="cursor-pointer hover:bg-purple-700 hover:text-white data-[state=selected]:bg-purple-700 data-[state=selected]:text-white"
                >
                  <Check className={cn("mr-2 h-4 w-4", value === country.dialCode ? "opacity-100" : "opacity-0")} />
                  {country.dialCode} ({country.name})
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}