import { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'

const DEFAULT_CATEGORIES = [
  { category: 'Groceries', expenses: [] },
  { category: 'Rent', expenses: [] },
  { category: 'Entertainment', expenses: [] },
  { category: 'Transportation', expenses: [] },
  { category: 'Restaurants', expenses: [] },
  { category: 'Subscriptions', expenses: [] },
]

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const { userId, period } = req.query

      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ message: 'User ID is required' })
      }

      if (!period || typeof period !== 'string') {
        return res.status(400).json({ message: 'Period is required' })
      }

      // Get user document from Firestore
      const userRef = doc(db, 'users', userId)
      const userSnap = await getDoc(userRef)

      if (!userSnap.exists()) {
        return res.status(404).json({ message: 'User not found' })
      }

      const userData = userSnap.data()
      const reports = userData.reports || []

      // Find the expense period that matches the requested period
      const currentPeriodData = reports.find(
        (report: { period: string }) => report.period === period
      )

      if (!currentPeriodData) {
        return res.status(404).json({ message: 'Period not found' })
      }

      // Return the transactions array directly
      return res.status(200).json(currentPeriodData.transactions)

    } catch (error) {
      console.error('Error fetching expenses:', error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }
  else if (req.method === 'POST') {
    try {
      const { userId } = req.query;
      const { category, amount, date, note = '' } = req.body;

      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ message: 'User ID is required' });
      }

      if (!category || typeof category !== 'string') {
        return res.status(400).json({ message: 'Category is required' });
      }

      if (!amount || typeof amount !== 'number') {
        return res.status(400).json({ message: 'Amount is required and must be a number' });
      }

      if (!date || typeof date !== 'string') {
        return res.status(400).json({ message: 'Date is required' });
      }

      // Calculate the period from the date
      const transactionDate = new Date(date);
      if (isNaN(transactionDate.getTime())) {
        return res.status(400).json({ message: 'Invalid date format' });
      }
      const period = transactionDate.toLocaleString('en-US', {
        month: 'long',
        year: 'numeric',
      });

      // Get user document from Firestore
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return res.status(404).json({ message: 'User not found' });
      }

      const userData = userSnap.data();
      const reports = [...(userData.reports || [])];

      // Find or create report for the period
      let periodIndex = reports.findIndex((report) => report.period === period);

      if (periodIndex === -1) {
        // Period doesn't exist, create a new one with default categories
        reports.push({
          period,
          transactions: [...DEFAULT_CATEGORIES],
        });
        periodIndex = reports.length - 1;
      }

      // Find the category in the transactions
      const categoryIndex = reports[periodIndex].transactions.findIndex(
        (t: { category: string }) => t.category === category
      );

      if (categoryIndex === -1) {
        return res.status(404).json({ message: 'Category not found' });
      }

      // Add the new expense
      const newExpense = {
        amount,
        date,
        note,
      };

      reports[periodIndex].transactions[categoryIndex].expenses.push(newExpense);

      // Update the document
      await updateDoc(userRef, { reports });

      return res.status(200).json({ message: 'Expense added successfully' });
    } catch (error) {
      console.error('Error adding expense:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  else {
    return res.status(405).json({ message: 'Method not allowed' })
  }
}
