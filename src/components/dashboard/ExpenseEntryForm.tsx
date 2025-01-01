'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { SearchableDropdown } from '@/components/ui/SearchableDropdown'

interface ExpenseEntryFormProps {
  onClose: () => void
  onSubmit: (formData: any) => Promise<void>
  categories: string[]
  initialData: {
    category: string
    date: string
    amount: string
    note: string
  }
  hideBackdrop?: boolean
  hideClose?: boolean
  onAddCategory: (category: string) => Promise<void>
}

export function ExpenseEntryForm({
  onClose,
  onSubmit,
  categories,
  initialData,
  hideBackdrop = false,
  hideClose = false,
  onAddCategory
}: ExpenseEntryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    category: initialData.category,
    date: initialData.date,
    amount: initialData.amount,
    note: initialData.note
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSubmitting(true)
      await onSubmit(formData)
    } catch (error) {
      console.error('Error submitting expense:', error)
      // TODO: Add error handling
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {!hideBackdrop && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}
      <div className={cn(
        "w-full max-w-lg mx-auto",
        !hideBackdrop && "fixed inset-0 z-50 flex items-center justify-center p-4"
      )}>
        <div className="w-full max-w-md bg-slate-900/95 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-800">
            <h3 className="text-lg font-semibold text-slate-200">
              Add Expense
            </h3>
            {!hideClose && (
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-slate-300 mb-1">
                Category
              </label>
              <SearchableDropdown
                value={formData.category}
                options={categories}
                onChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                onAddNew={onAddCategory}
              />
            </div>

            {/* Date */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-slate-300 mb-1">
                Date
              </label>
              <input
                type="date"
                id="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
                className={cn(
                  "w-full px-3 py-2 rounded-lg transition-all duration-300",
                  "bg-slate-800/50 border border-slate-700",
                  "text-slate-200 focus:outline-none",
                  "focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                )}
              />
            </div>

            {/* Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-slate-300 mb-1">
                Amount
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <span className="text-slate-400">$</span>
                </div>
                <input
                  type="number"
                  id="amount"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  required
                  step="0.01"
                  min="0"
                  className={cn(
                    "w-full pl-7 pr-3 py-2 rounded-lg transition-all duration-300",
                    "bg-slate-800/50 border border-slate-700",
                    "text-slate-200 focus:outline-none",
                    "focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                  )}
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-slate-300 mb-1">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                value={formData.note}
                onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                rows={2}
                className={cn(
                  "w-full px-3 py-2 rounded-lg transition-all duration-300",
                  "bg-slate-800/50 border border-slate-700",
                  "text-slate-200 focus:outline-none",
                  "focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500",
                  "resize-none"
                )}
                placeholder="Add any additional details..."
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "w-full px-4 py-2 rounded-lg font-medium transition-all duration-300",
                "bg-gradient-to-r from-blue-600 to-emerald-600",
                "hover:from-blue-500 hover:to-emerald-500",
                "text-white shadow-lg",
                "border border-white/10",
                "disabled:from-slate-700 disabled:to-slate-700",
                "disabled:text-slate-400 disabled:cursor-not-allowed",
                "disabled:border-slate-800"
              )}
            >
              {isSubmitting ? 'Adding Expense...' : 'Add Expense'}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
