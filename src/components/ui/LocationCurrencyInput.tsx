'use client'

import { useState } from 'react'
import { UserInput } from './UserInput'
import { cn } from '@/lib/utils'

interface Location {
  country: string
  currency: string
}

const COUNTRIES: Location[] = [
  { country: 'United States', currency: 'USD' },
  { country: 'Canada', currency: 'CAD' },
]

export function LocationCurrencyInput({
  className,
  onLocationChange
}: {
  className?: string
  onLocationChange?: (location: Location) => void
}) {
  const [selected, setSelected] = useState<Location | null>(null)

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const country = COUNTRIES.find(c => c.country === e.target.value) || null
    setSelected(country)
    if (country) {
      onLocationChange?.(country)
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200">
          Country
        </label>
        <div className="relative">
          <select
            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-lg text-slate-200
                     focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
            value={selected?.country || ''}
            onChange={handleSelect}
            required
          >
            <option value="">Select a country</option>
            {COUNTRIES.map((country) => (
              <option key={country.country} value={country.country}>
                {country.currency} - {country.country}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
