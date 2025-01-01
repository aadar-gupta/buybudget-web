// Function to generate random color
export const generateColor = () => {
  const hue = Math.floor(Math.random() * 360)
  return `hsl(${hue}, 70%, 50%)`
}

export const DEFAULT_CATEGORIES = [
  { category: 'Groceries', expenses: [], color: generateColor() },
  { category: 'Rent', expenses: [], color: generateColor() },
  { category: 'Entertainment', expenses: [], color: generateColor() },
  { category: 'Transportation', expenses: [], color: generateColor() },
  { category: 'Restaurants', expenses: [], color: generateColor() },
  { category: 'Subscriptions', expenses: [], color: generateColor() },
]
