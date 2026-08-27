import React, { useState, useEffect, useRef } from 'react'
import { MapPin, Loader2, Navigation, X } from 'lucide-react'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { fetchLocationSuggestions } from '../../services/api'
import type { LocationSuggestion } from '../../types/trip'

interface LocationInputProps {
  id: string
  label: string
  placeholder: string
  value: string
  onChange: (val: string) => void
  iconColor?: string
  required?: boolean
}

export const LocationInput: React.FC<LocationInputProps> = ({
  id,
  label,
  placeholder,
  value,
  onChange,
  iconColor = "text-[#8AE922]",
  required = false
}) => {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const userTypedRef = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Only search suggestions if user actively typed into THIS specific input
    if (!userTypedRef.current || !value || value.trim().length < 2) {
      setSuggestions([])
      setIsOpen(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsLoading(true)
      try {
        const results = await fetchLocationSuggestions(value)
        // If user is still focused and typing, show results
        if (userTypedRef.current) {
          setSuggestions(results)
          setIsOpen(results.length > 0)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [value])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        userTypedRef.current = false
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (item: LocationSuggestion) => {
    userTypedRef.current = false
    onChange(item.name || item.display_name)
    setSuggestions([])
    setIsOpen(false)
  }

  const handleClear = () => {
    userTypedRef.current = false
    onChange('')
    setSuggestions([])
    setIsOpen(false)
  }

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="flex items-center justify-between mb-1">
        <Label htmlFor={id} className="text-xs text-slate-300 font-semibold font-heading">
          {label} {required && <span className="text-[#8AE922]">*</span>}
        </Label>
      </div>

      <div className="relative">
        <Input
          id={id}
          value={value}
          onChange={(e) => {
            userTypedRef.current = true
            onChange(e.target.value)
          }}
          onFocus={() => {
            if (userTypedRef.current && suggestions.length > 0) {
              setIsOpen(true)
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsOpen(false)
              userTypedRef.current = false
            }
          }}
          placeholder={placeholder}
          required={required}
          icon={
            isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-[#8AE922]" />
            ) : (
              <MapPin className={`h-4 w-4 ${iconColor}`} />
            )
          }
          className="border-white/10 focus-visible:border-[#8AE922]/70 bg-[#080D0A] text-slate-200 placeholder:text-slate-500 rounded-xl text-xs sm:text-sm pr-8"
          autoComplete="off"
        />

        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1 transition-colors"
            title="Clear input"
          >
            <X size={13} />
          </button>
        )}

        {isOpen && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-2 z-[100] rounded-2xl border border-[#8AE922]/40 bg-[#0C140F]/98 shadow-2xl backdrop-blur-2xl max-h-60 overflow-y-auto custom-scrollbar divide-y divide-white/5 animate-in fade-in zoom-in-95 duration-150">
            {suggestions.map((item, idx) => (
              <button
                key={`${item.lat}-${item.lng}-${idx}`}
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full px-4 py-2.5 text-left text-xs text-slate-200 hover:bg-[#8AE922]/15 hover:text-white transition-colors flex items-center space-x-2.5 group"
              >
                <Navigation className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#8AE922] shrink-0" />
                <div className="truncate">
                  <span className="font-bold text-white block truncate">
                    {item.name}
                  </span>
                  <span className="text-[11px] text-slate-400 block truncate font-medium">
                    {item.display_name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
