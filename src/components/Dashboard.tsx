'use client'

import { GradientTitle } from '@/components/ui/GradientTitle'
import { motion } from 'framer-motion'
import { useEffect, useState, useMemo } from 'react'
import { parseCookies } from 'nookies'
import { ExpensePieChart } from './dashboard/ExpensePieChart'
import { ExpenseLegend } from './dashboard/ExpenseLegend'
import { Download, Loader2 } from 'lucide-react'
import * as XLSX from 'xlsx'
import { cn } from '@/lib/utils'
import { ExpenseReportButton } from '@/components/dashboard/ExpenseReportButton'
import { ExpenseEntryForm } from '@/components/dashboard/ExpenseEntryForm'
import { ReceiptUpload } from '@/components/dashboard/ReceiptUpload'
import { ExpenseWithReceipt } from './dashboard/ExpenseWithReceipt'
import { ProfileAvatar } from './profile/ProfileAvatar'

type CategoryTotal = {
  category: string
  total: number
}

type Transaction = {
  category: string
  expenses: Array<{
    amount: number
    date: string
    note: string
  }>
}

interface ExpenseFormData {
  category: string;
  date: string;
  amount: string;
  note: string;
}

export function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categoryTotals, setCategoryTotals] = useState<CategoryTotal[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryColors, setCategoryColors] = useState<{ [key: string]: string }>({});
  const [budget, setBudget] = useState(0)
  const [tempBudget, setTempBudget] = useState('0')
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [periods, setPeriods] = useState<string[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isUpdatingBudget, setIsUpdatingBudget] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showReceiptUpload, setShowReceiptUpload] = useState(false);
  const [profileInitials, setProfileInitials] = useState<string>('');
  const [formData, setFormData] = useState<ExpenseFormData>({
    category: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    note: ''
  })
  const [receiptImage, setReceiptImage] = useState<string | null>(null)
  const [detectedValues, setDetectedValues] = useState<{
    amount: number | null;
    date: string | null;
  }>({
    amount: null,
    date: null
  });

  const fetchUserProfile = async () => {
    try {
      const { userId } = parseCookies();
      const response = await fetch(`/api/profile/${userId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const data = await response.json();
      setProfileInitials(data.name || '');
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };


  // Fetch periods
  const fetchPeriods = async () => {
    try {
      const { userId } = parseCookies()
      const response = await fetch(`/api/period/${userId}`, {
        method: 'GET'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch periods')
      }

      const data = await response.json()
      setPeriods(data)

      if (data.length > 0) {
        setSelectedPeriod(data[0])
      }
    } catch (error) {
      console.error('Error fetching periods:', error)
    }
  }

  // Fetch budget
  const fetchBudget = async () => {
    try {
      const { userId } = parseCookies()
      const response = await fetch(`/api/budget/${userId}?period=${selectedPeriod}`, {
        method: 'GET'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch budget')
      }

      const data = await response.json()
      setBudget(data.budget || 0)
      setTempBudget((data.budget || 0).toString())
    } catch (error) {
      console.error('Error fetching budget:', error)
    }
  }

  // Fetch all data
  const fetchAllData = async () => {
    setIsLoadingData(true)
    try {
      await Promise.all([
        fetchPeriods()
      ])
    } catch (error) {
      console.error('Error fetching initial data:', error)
    } finally {
      setIsLoadingData(false)
    }
  }

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      const { userId } = parseCookies()
      const response = await fetch(`/api/transactions/${userId}?period=${selectedPeriod}`, {
        method: 'GET'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch transactions')
      }

      const data = await response.json()

      setTransactions(data || [])

      const totals = data.reduce((acc: CategoryTotal[], transaction: Transaction) => {
        const total = transaction.expenses.reduce((sum, expense) => sum + expense.amount, 0)
        if (total > 0) {
          acc.push({
            category: transaction.category,
            total
          })
        }
        return acc
      }, [])

      setCategoryTotals(totals)
    } catch (error) {
      console.error('Error fetching transactions:', error)
    }
  }

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const { userId } = parseCookies();
      const response = await fetch(`/api/categories/${userId}?period=${selectedPeriod}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const data = await response.json();
      setCategories(data.categories.map((cat: { category: string }) => cat.category));

      // Set category colors for visualization
      const colors = data.categories.reduce((acc: { [key: string]: string }, cat: { category: string; color: string }) => {
        acc[cat.category] = cat.color;
        return acc;
      }, {});

      setCategoryColors(colors);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  // Add new category
  const handleAddCategory = async (newCategory: string) => {
    try {
      const { userId } = parseCookies()
      const response = await fetch(`/api/categories/${userId}?period=${selectedPeriod}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newCategory: newCategory })
      })

      if (!response.ok) {
        throw new Error('Failed to add category')
      }

      // Refresh all data after adding category
      await fetchAllData()
      await fetchCategories()
    } catch (error) {
      console.error('Error adding category:', error)
      throw error
    }
  }

  // Handle expense submission
  const handleExpenseSubmit = async (formData: {
    category: string;
    date: string;
    amount: string;
    note: string;
  }) => {
    try {
      const { userId } = parseCookies()

      const submitData = {
        ...formData,
        amount: parseFloat(formData.amount),
      }

      const response = await fetch(`/api/transactions/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      })

      if (!response.ok) {
        throw new Error('Failed to submit expense')
      }

      // Refresh all data after adding transaction
      fetchBudget()
      fetchCategories()
      fetchTransactions()
      fetchPeriods()
      setShowExpenseForm(false)
    } catch (error) {
      console.error('Error submitting expense:', error)
    }
  }

  // Initial data fetch - only fetch periods, categories on mount
  useEffect(() => {
    const initializeData = async () => {
      setIsLoadingData(true)
      try {
        await Promise.all([
          fetchPeriods(),
          fetchUserProfile()
        ])
      } catch (error) {
        console.error('Error fetching initial data:', error)
      } finally {
        setIsLoadingData(false)
      }
    }

    initializeData()
  }, [])

  // Fetch transactions and budget when period is selected
  useEffect(() => {
    if (selectedPeriod) {
      const fetchPeriodData = async () => {
        try {
          await Promise.all([
            fetchBudget(),
            fetchCategories(),
            fetchTransactions()
          ])
        } catch (error) {
          console.error('Error fetching period data:', error)
        }
      }

      fetchPeriodData()
    }
  }, [selectedPeriod]) // Only run when selectedPeriod changes

  // Calculate total spending
  const totalSpending = categoryTotals.reduce((sum, category) => sum + category.total, 0)

  const exportData = (format: 'csv' | 'xlsx') => {
    // Flatten and sort transactions by date
    const flattenedData = transactions.flatMap(transaction =>
      transaction.expenses.map(expense => {
        // Format date as a single string
        const date = new Date(expense.date).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        }).replace(/,/g, '') // Remove commas from date string to prevent CSV splitting

        return {
          Date: date,
          Category: transaction.category,
          Notes: expense.note || '',
          Amount: expense.amount
        }
      })
    ).sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime())

    // Add total row
    const totalRow = {
      Date: 'TOTAL',
      Category: '',
      Notes: '',
      Amount: totalSpending
    }

    const dataWithTotal = [...flattenedData, totalRow]

    if (format === 'csv') {
      // Generate CSV
      const csvContent = [
        // Header
        ['Date', 'Category', 'Notes', 'Amount'].join(','),
        // Data rows
        ...dataWithTotal.map(row =>
          [
            `"${row.Date}"`, // Wrap date in quotes to keep it as one field
            `"${row.Category}"`, // Wrap category in quotes to handle any commas
            `"${(row.Notes || '').replace(/"/g, '""')}"`, // Escape quotes in notes
            row.Amount.toFixed(2)
          ].join(',')
        )
      ].join('\n')

      // Create and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `expenses_${selectedPeriod.replace(' ', '_')}.csv`
      link.click()
    } else {
      // Generate XLSX
      const ws = XLSX.utils.json_to_sheet(dataWithTotal)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Expenses')

      // Auto-size columns
      const colWidths = [
        { wch: 15 }, // Date
        { wch: 15 }, // Category
        { wch: 30 }, // Notes
        { wch: 10 }, // Amount
      ]
      ws['!cols'] = colWidths

      // Style the total row
      const lastRow = dataWithTotal.length
      ws['!rows'] = [
        { hpt: 24 }, // Header height
        ...Array(lastRow - 1).fill({ hpt: 20 }), // Data rows height
        { hpt: 24 } // Total row height
      ]

      XLSX.writeFile(wb, `expenses_${selectedPeriod.replace(' ', '_')}.xlsx`)
    }
  }

  // Update handleBudgetUpdate to use PUT
  const handleBudgetUpdate = async () => {
    try {
      setIsUpdatingBudget(true)
      const { userId } = parseCookies()

      const response = await fetch(`/api/budget/${userId}?period=${selectedPeriod}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          budget: tempBudget
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update budget')
      }

      await fetchBudget()
    } catch (error) {
      console.error('Error updating budget:', error)
      setTempBudget(budget.toString())
    } finally {
      setIsUpdatingBudget(false)
    }
  }

  const handleReceiptAmount = (amount: number, image: string, date: string) => {
    setShowReceiptUpload(false)
    setReceiptImage(image)
    setDetectedValues({
      amount,
      date
    })
    setFormData({
      category: categories[0] || '',
      date: date,
      amount: amount.toFixed(2),
      note: ''
    })
    setShowExpenseForm(true)
  }

  const handleManualEntry = () => {
    setFormData({
      category: categories[0] || '',
      date: new Date().toISOString().split('T')[0],
      amount: '',
      note: ''
    })
    setShowExpenseForm(true)
  }

  const handleUploadReceipt = () => {
    setShowReceiptUpload(true)
  }

  const handleCloseForm = () => {
    setShowExpenseForm(false)
    setReceiptImage(null)
    setDetectedValues({
      amount: null,
      date: null
    })
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="absolute top-4 right-4 z-10">
        <ProfileAvatar name={profileInitials} />
      </div>

      <div className="container mx-auto px-4 pt-24 pb-32">
        {isLoadingData ? (
           <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
           <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
         </div>
        ) : (
          <>
            {/* Decorative elements */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
              <div className="absolute -top-1/2 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-10" />
              <div className="absolute -bottom-1/2 left-0 w-96 h-96 bg-emerald-500 rounded-full blur-3xl opacity-10" />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full"
            >
              {/* Title and Controls Container */}
              <div className="flex flex-col gap-4 mb-8">
                {/* Title and Period Selector Row */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div className="flex items-center justify-between p-4">
                    <GradientTitle className="text-xl font-semibold">
                      Dashboard
                    </GradientTitle>
                  </div>

                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    {/* Period Selector */}
                    <div className="w-full md:w-48">
                      <select
                        className={cn(
                          "w-full px-4 py-2 rounded-lg transition-all duration-300",
                          "bg-slate-900/50 border border-slate-800",
                          "text-slate-200 focus:outline-none",
                          "focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                        )}
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                      >
                        {periods && periods.map((period) => (
                          <option key={period} value={period}>
                            {period}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Budget Input and Save Button */}
                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <div className="relative flex-1 md:flex-none md:w-36">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                          <span className="text-slate-400">$</span>
                        </div>
                        <input
                          type="number"
                          value={tempBudget}
                          onChange={(e) => setTempBudget(e.target.value)}
                          className={cn(
                            "w-full pl-7 pr-4 py-2 rounded-lg transition-all duration-300",
                            "bg-slate-900/50 border border-slate-800",
                            "text-slate-200 focus:outline-none",
                            "focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                          )}
                          placeholder="Budget"
                          step="0.01"
                          min="0"
                        />
                      </div>

                      <button
                        onClick={handleBudgetUpdate}
                        disabled={isUpdatingBudget || parseFloat(tempBudget) === budget}
                        className={cn(
                          "px-4 py-2 rounded-lg font-medium transition-all duration-300",
                          "bg-gradient-to-r from-blue-600 to-emerald-600",
                          "hover:from-blue-500 hover:to-emerald-500",
                          "text-white shadow-lg whitespace-nowrap",
                          "border border-white/10",
                          "disabled:from-slate-700 disabled:to-slate-700",
                          "disabled:text-slate-400 disabled:cursor-not-allowed",
                          "disabled:border-slate-800"
                        )}
                      >
                        {isUpdatingBudget ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:items-start">
                <ExpensePieChart
                  categoryTotals={categoryTotals}
                  categoryColors={categoryColors}
                  budget={budget}
                  onExport={exportData}
                />
                <ExpenseLegend
                  transactions={transactions}
                  categoryColors={categoryColors}
                />
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* Add Expense Form Modal */}
      {showExpenseForm && (
        receiptImage ? (
          <ExpenseWithReceipt
            receiptImage={receiptImage}
            onClose={handleCloseForm}
            onSubmit={handleExpenseSubmit}
            onAddCategory={handleAddCategory}
            categories={categories}
            initialData={formData}
          />
        ) : (
          <ExpenseEntryForm
            onClose={handleCloseForm}
            onSubmit={handleExpenseSubmit}
            onAddCategory={handleAddCategory}
            categories={categories}
            initialData={formData}
          />
        )
      )}

      {/* Receipt Upload Modal */}
      {showReceiptUpload && (
        <ReceiptUpload
          onClose={() => setShowReceiptUpload(false)}
          onDetectedAmount={handleReceiptAmount}
        />
      )}

      {/* Expense Report Button */}
      <ExpenseReportButton
        onManualClick={handleManualEntry}
        onUploadClick={handleUploadReceipt}
      />
    </main>
  )
}
