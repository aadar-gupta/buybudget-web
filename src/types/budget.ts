export interface Category {
  category: string
  value: number
  color: string
  expenses?: Array<{
    name: string
    date: string
    amount: number
    notes: string
  }>
}
