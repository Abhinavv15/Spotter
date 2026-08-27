import React, { useState, useEffect, useRef } from 'react'
import { MapPin, Loader2, Navigation } from 'lucide-react'
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
  iconColor = "text-primary",
  required = false
}) => {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!value || value.trim().length < 2) {
      setSuggestions([])
      setIsOpen(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsLoading(true)
      try {
        const results = await fetchLocationSuggestions(value)
        setSuggestions(results)
        setIsOpen(results.length > 0)
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }, 280)

    return () => clearTimeout(timer)
  }, [value])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (item: LocationSuggestion) => {
    onChange(item.name || item.display_name)
    setIsOpen(false)
  }

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="flex items-center justify-between mb-1">
        <Label htmlFor={id} className="text-xs text-slate-300">
          {label} {required && <span className="text-primary">*</span>}
        </Label>
      </div>

      <div className="relative">
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true)
          }}
          placeholder={placeholder}
          required={required}
          icon={
            isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <MapPin className={`h-4 w-4 ${iconColor}`} />
            )
          }
          className="border-white/15 focus-visible:border-primary/60 bg-spotter-space/80"
          autoComplete="off"
        />

        {isOpen && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl border border-white/15 bg-spotter-space/95 shadow-2xl backdrop-blur-xl max-h-60 overflow-y-auto divide-y divide-white/5 animate-in fade-in zoom-in-95 duration-150">
            {suggestions.map((item, idx) => (
              <button
                key={`${item.lat}-${item.lng}-${idx}`}
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full px-3.5 py-2.5 text-left text-xs text-slate-200 hover:bg-primary/15 hover:text-white transition-colors flex items-center space-x-2.5 group"
              >
                <Navigation className="h-3.5 w-3.5 text-slate-400 group-hover:text-primary shrink-0" />
                <div className="truncate">
                  <span className="font-semibold text-white block truncate">
                    {item.name}
                  </span>
                  <span className="text-[11px] text-slate-400 block truncate">
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
