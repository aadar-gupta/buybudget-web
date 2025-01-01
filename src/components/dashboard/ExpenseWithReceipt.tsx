'use client'

import { ExpenseEntryForm } from './ExpenseEntryForm'
import { cn } from '@/lib/utils'

interface ExpenseWithReceiptProps {
  receiptImage: string | null
  onClose: () => void
  onSubmit: (formData: {
    category: string
    date: string
    amount: string
    note: string
  }) => Promise<void>
  categories: string[]
  initialData: {
    category: string
    date: string
    amount: string
    note: string
  }
  onAddCategory: (category: string) => Promise<void>
}

export function ExpenseWithReceipt({
  receiptImage,
  onClose,
  onSubmit,
  categories,
  initialData,
  onAddCategory
}: ExpenseWithReceiptProps) {
  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-5xl bg-slate-900/95 border border-slate-800 rounded-2xl shadow-xl overflow-y-auto max-h-[90vh]">
          <div className="flex items-center justify-between p-4 border-b border-slate-800">
            <h3 className="text-lg font-semibold text-slate-200">
              Add Expense
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
            {receiptImage && (
              <div className="lg:w-1/2">
                <div className="sticky top-6">
                  <img
                    src={receiptImage}
                    alt="Receipt"
                    className="w-full rounded-lg border border-slate-700 shadow-lg"
                  />
                </div>
              </div>
            )}
            <div className={cn(
              "lg:w-1/2",
              !receiptImage && "w-full"
            )}>
              <ExpenseEntryForm
                onClose={onClose}
                onSubmit={onSubmit}
                onAddCategory={onAddCategory}
                categories={categories}
                initialData={initialData}
                hideBackdrop
                hideClose
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
