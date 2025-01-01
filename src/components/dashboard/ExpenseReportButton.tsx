'use client'

import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect, useRef } from 'react'

interface ExpenseReportButtonProps {
  onUploadClick: () => void
  onManualClick: () => void
}

export function ExpenseReportButton({ onUploadClick, onManualClick }: ExpenseReportButtonProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleOptionClick = (handler: () => void) => {
    setIsMenuOpen(false)
    handler()
  }

  return (
    <div className="fixed right-6 bottom-6 z-40" ref={menuRef}>
      <div className="relative group">
        <button
          className={cn(
            "w-24 h-24 rounded-full flex items-center justify-center",
            "bg-gradient-to-r from-blue-600 to-emerald-600",
            "hover:from-blue-500 hover:to-emerald-500 hover:scale-[120%]",
            "text-white shadow-lg transition-all duration-300",
            "border border-white/10"
          )}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Plus className="w-16 h-16" />
        </button>

        {isMenuOpen && (
          <div
            className={cn(
              "absolute bottom-28 right-0",
              "w-48 py-2 bg-slate-900 border border-slate-800",
              "rounded-lg shadow-xl"
            )}
          >
            <button
              onClick={() => handleOptionClick(onUploadClick)}
              className="w-full px-4 py-2 text-left text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Upload Receipt
            </button>
            <button
              onClick={() => handleOptionClick(onManualClick)}
              className="w-full px-4 py-2 text-left text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Manual Entry
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
