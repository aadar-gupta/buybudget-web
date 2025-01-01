interface ExpenseRow {
  date: string
  category: string
  name: string
  notes?: string
  amount: number
}

export const exportToExcel = (expenses: ExpenseRow[], monthYear: string) => {
  // Convert expenses to worksheet data
  const wsData = [
    ['Date', 'Category', 'Name', 'Notes', 'Amount'], // Headers
    ...expenses.map(expense => [
      new Date(expense.date).toLocaleDateString(),
      expense.category,
      expense.name,
      expense.notes || '', // Add notes column
      expense.amount
    ])
  ]

  // Sort expenses by date
  const sortedExpenses = expenses.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Create CSV content
  const headers = ['Date', 'Category', 'Name', 'Expense Amount']
  const rows = sortedExpenses.map(expense => [
    new Date(expense.date).toLocaleDateString(),
    expense.category,
    expense.name,
    expense.amount
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `budget_expenses_${monthYear.replace(' ', '_')}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
