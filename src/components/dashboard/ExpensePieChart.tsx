'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GradientTitle } from '@/components/ui/GradientTitle'

interface ExpensePieChartProps {
  categoryTotals: Array<{
    category: string
    total: number
  }>
  categoryColors: { [key: string]: string }
  budget: number
  onExport: (type: 'csv' | 'xlsx') => void
}

export function ExpensePieChart({ categoryTotals, categoryColors, budget, onExport }: ExpensePieChartProps) {
  const totalExpenses = categoryTotals.reduce((sum, category) => sum + category.total, 0)
  const remainingBudget = Math.max(budget - totalExpenses, 0)

  const chartData = budget > 0
    ? [
        ...categoryTotals,
        {
          category: 'Remaining Budget',
          total: remainingBudget
        }
      ]
    : categoryTotals

  const allColors: { [key: string]: string } = {
    ...categoryColors,
    'Remaining Budget': 'rgba(0, 0, 0, 0)'
  }

  const borderColors: { [key: string]: string } = {
    ...Object.keys(categoryColors).reduce((acc, key) => ({
      ...acc,
      [key]: 'rgba(0, 0, 0, 0)'
    }), {}),
    'Remaining Budget': '#ffffff'
  }

  const borderWidths: { [key: string]: number } = {
    ...Object.keys(categoryColors).reduce((acc, key) => ({
      ...acc,
      [key]: 0
    }), {}),
    'Remaining Budget': 2
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 shadow-xl">
          <p className="text-slate-200 font-semibold">{data.category}</p>
          <p className="text-slate-400">${data.total.toFixed(2)}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800 flex flex-col gap-6 h-auto md:h-[600px]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <GradientTitle className="text-xl md:text-2xl font-semibold">
          Spending Overview
        </GradientTitle>
        <div className="relative">
          <button
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300",
              "bg-gradient-to-r from-blue-600 to-emerald-600",
              "hover:from-blue-500 hover:to-emerald-500",
              "text-white text-sm shadow-lg",
              "border border-white/10"
            )}
            onClick={() => {
              const dropdown = document.getElementById('export-dropdown')
              if (dropdown) {
                dropdown.classList.toggle('hidden')
              }
            }}
          >
            <span>Export as</span>
            <Download className="w-4 h-4" />
          </button>
          <div
            id="export-dropdown"
            className="hidden absolute right-0 mt-2 w-32 py-2 bg-slate-900 border border-slate-800 rounded-lg shadow-xl z-10"
          >
            <button
              onClick={() => onExport('csv')}
              className="w-full px-4 py-2 text-left text-slate-200 hover:bg-slate-800 transition-colors"
            >
              CSV
            </button>
            <button
              onClick={() => onExport('xlsx')}
              className="w-full px-4 py-2 text-left text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Excel
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800/50 p-3 rounded-lg flex flex-col items-center">
          <div className="text-sm text-slate-400">Spent</div>
          <div className="text-lg text-slate-200">${totalExpenses.toFixed(2)}</div>
        </div>
        <div className="bg-slate-800/50 p-3 rounded-lg flex flex-col items-center">
          <div className="text-sm text-slate-400">Remaining</div>
          <div className="text-lg text-slate-200">${remainingBudget.toFixed(2)}</div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%" minHeight={200}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="total"
              nameKey="category"
              cx="50%"
              cy="50%"
              outerRadius="80%"
              labelLine={false}
            >
              {chartData.map((entry) => (
                <Cell
                  key={entry.category}
                  fill={allColors[entry.category]}
                  stroke={borderColors[entry.category]}
                  strokeWidth={borderWidths[entry.category]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
