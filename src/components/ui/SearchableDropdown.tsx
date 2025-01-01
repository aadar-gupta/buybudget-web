'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { PlusIcon } from '@/components/icons/PlusIcon'
import { Loader2 } from 'lucide-react'

interface SearchableDropdownProps {
  value: string
  options: string[]
  onChange: (value: string) => void
  onAddNew: (value: string) => Promise<void>
  isLoading?: boolean
}

export function SearchableDropdown({
  value,
  options,
  onChange,
  onAddNew,
  isLoading
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(search.toLowerCase())
  )

  const handleAddNew = async () => {
    try {
      setIsAdding(true)
      await onAddNew(search)
      onChange(search)
      setSearch('')
      setIsOpen(false)
    } catch (error) {
      console.error('Error adding category:', error)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div ref={dropdownRef} className="relative">
      <input
        type="text"
        value={isOpen ? search : value}
        onChange={(e) => {
          setSearch(e.target.value)
          setIsOpen(true)
        }}
        onFocus={() => {
          setIsOpen(true)
          setSearch('')
        }}
        placeholder="Search or add category..."
        className={cn(
          "w-full px-3 py-2 rounded-lg transition-all duration-300",
          "bg-slate-800/50 border border-slate-700",
          "text-slate-200 focus:outline-none",
          "focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
        )}
      />

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl max-h-60 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : (
            <>
              {filteredOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    onChange(option)
                    setIsOpen(false)
                    setSearch('')
                  }}
                  className="w-full px-3 py-2 text-left text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  {option}
                </button>
              ))}

              {search && !filteredOptions.includes(search) && (
                <button
                  onClick={handleAddNew}
                  disabled={isAdding}
                  className={cn(
                    "w-full px-3 py-2 text-left transition-colors",
                    "flex items-center gap-2",
                    "text-emerald-400 hover:bg-slate-800"
                  )}
                >
                  {isAdding ? (
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  ) : (
                    <PlusIcon className="w-4 h-4" />
                  )}
                  <span>
                    {isAdding ? 'Adding...' : `Add "${search}" as new category`}
                  </span>
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
