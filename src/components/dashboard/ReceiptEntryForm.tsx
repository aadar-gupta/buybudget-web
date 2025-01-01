'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { SearchableDropdown } from '../ui/SearchableDropdown'
import { AlertCircle } from 'lucide-react'
import { Modal } from '../ui/Modal'

interface ReceiptEntryFormProps {
  receiptImage: string
  onClose: () => void
  onSubmit: (formData: {
    category: string
    date: string
    amount: string
    note: string
  }) => Promise<void>
  onAddCategory: (category: string) => Promise<void>
  categories: string[]
  initialData: {
    category: string
    date: string
    amount: string
    note: string
  }
  currentPeriod: string
}

export function ReceiptEntryForm({
  receiptImage,
  onClose,
  onSubmit,
  onAddCategory,
  categories,
  initialData,
  currentPeriod
}: ReceiptEntryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState(initialData)
  const [showDateAlert, setShowDateAlert] = useState(false)

  useEffect(() => {
    // Check date when component mounts or when date changes
    const isInPeriod = isDateInPeriod(formData.date)
    setShowDateAlert(!isInPeriod)
  }, [])

  const isDateInPeriod = (date: string) => {
    const [year, month] = date.split('-')
    const receiptDate = new Date(parseInt(year), parseInt(month) - 1)
    const [periodMonth, periodYear] = currentPeriod.split(' ')
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    const periodMonthIndex = months.indexOf(periodMonth)
    const periodDate = new Date(parseInt(periodYear), periodMonthIndex)

    return receiptDate.getFullYear() === periodDate.getFullYear() &&
           receiptDate.getMonth() === periodDate.getMonth()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      onClose()
    } catch (error) {
      console.error('Error submitting expense:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={true} onClose={onClose}>
      <div className="w-full">
        {showDateAlert && (
          <div className="p-4 bg-amber-500/10 border-b border-amber-500/20">
            <div className="flex items-center gap-2 text-amber-500">
              <AlertCircle className="w-5 h-5" />
              <span>
                This receipt is dated {new Date(formData.date).toLocaleDateString()} but you're recording expenses for {currentPeriod}
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h3 className="text-lg font-semibold text-slate-200">
            Add Expense from Receipt
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 p-6">
          {/* Receipt Preview */}
          <div className="lg:w-1/2">
            <div className="sticky top-6">
              <img
                src={receiptImage}
                alt="Receipt"
                className="w-full rounded-lg border border-slate-700 shadow-lg"
              />
            </div>
          </div>

          {/* Form */}
          <div className="lg:w-1/2">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">
                  Category
                </label>
                <SearchableDropdown
                  value={formData.category}
                  options={categories}
                  onChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  onAddNew={onAddCategory}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">
                  Date
                </label>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className={cn(
                      "w-full px-3 py-2 bg-slate-800 border rounded-lg",
                      "text-slate-200 focus:outline-none focus:ring-2",
                      "focus:ring-blue-500 focus:border-transparent",
                      !isDateInPeriod(formData.date) && "border-amber-500"
                    )}
                    required
                  />
                  {!isDateInPeriod(formData.date) && (
                    <div className="flex items-center gap-2 text-amber-500">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">
                        This receipt is not from {currentPeriod}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  className={cn(
                    "w-full px-3 py-2 bg-slate-800 border border-slate-700",
                    "rounded-lg text-slate-200 focus:outline-none focus:ring-2",
                    "focus:ring-blue-500 focus:border-transparent"
                  )}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">
                  Note
                </label>
                <input
                  type="text"
                  value={formData.note}
                  onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                  className={cn(
                    "w-full px-3 py-2 bg-slate-800 border border-slate-700",
                    "rounded-lg text-slate-200 focus:outline-none focus:ring-2",
                    "focus:ring-blue-500 focus:border-transparent"
                  )}
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    "px-4 py-2 rounded-lg font-medium transition-all duration-300",
                    "bg-emerald-600 hover:bg-emerald-500",
                    "text-white shadow-lg",
                    isSubmitting && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Modal>
  )
}
