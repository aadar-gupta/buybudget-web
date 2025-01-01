import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { GradientTitle } from '@/components/ui/GradientTitle'
import { cn } from '@/lib/utils'

interface Transaction {
  category: string
  expenses: Array<{
    amount: number
    date: string
    note: string
  }>
}

interface ExpenseLegendProps {
  transactions: Transaction[]
  categoryColors: { [key: string]: string }
}

export function ExpenseLegend({ transactions, categoryColors }: ExpenseLegendProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  const toggleCategory = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category)
  }

  // Calculate total for each category
  const getCategoryTotal = (expenses: Array<{ amount: number }>) => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0)
  }

  // Format date to English form (e.g., "March 15, 2024")
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className={cn(
      "bg-slate-900/50 rounded-xl p-6 border border-slate-800",
      "lg:h-[600px] flex flex-col"
    )}>
      <GradientTitle className="text-xl md:text-2xl mb-8">
        Transaction Details
      </GradientTitle>
      <div className={cn(
        "flex-1",
        "lg:overflow-y-auto lg:pr-2",
        "space-y-6",
        "lg:scrollbar-thin lg:scrollbar-track-slate-800 lg:scrollbar-thumb-slate-700"
      )}>
        {transactions.map((transaction) => {
          const categoryTotal = getCategoryTotal(transaction.expenses)

          return (
            <div key={transaction.category} className="space-y-3">
              <button
                onClick={() => toggleCategory(transaction.category)}
                className={cn(
                  "w-full flex items-center justify-between p-4",
                  "rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
                )}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: categoryColors[transaction.category] }}
                  />
                  <span className="text-slate-200">{transaction.category}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-slate-400">${categoryTotal.toFixed(2)}</span>
                  {expandedCategory === transaction.category ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </button>

              {expandedCategory === transaction.category && (
                <div className="pl-4 space-y-3">
                  {transaction.expenses.map((expense, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg bg-slate-800/30 border border-slate-800"
                    >
                      <div className="flex justify-between text-slate-300">
                        <span>${expense.amount.toFixed(2)}</span>
                        <span>{formatDate(expense.date)}</span>
                      </div>
                      {expense.note && (
                        <p className="mt-2 text-sm text-slate-400">{expense.note}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
