import { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { DEFAULT_CATEGORIES, generateColor } from '@/constants/categories'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const { userId, period } = req.query;

      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ message: 'User ID is required' });
      }

      if (!period || typeof period !== 'string') {
        return res.status(400).json({ message: 'Period is required' });
      }

      // Get user document from Firestore
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return res.status(404).json({ message: 'User not found' });
      }

      const userData = userSnap.data();
      const reports = userData.reports || [];

      // Find the expense period that matches the requested period
      const currentPeriodData = reports.find(
        (report: { period: string }) => report.period === period
      );

      if (!currentPeriodData) {
        // If the period doesn't exist, initialize it with default categories
        const report = {
          period,
          budget: 0,
          transactions: [...DEFAULT_CATEGORIES],
        };
        reports.push(report);
        await updateDoc(userRef, { reports });
      } else {
        // Ensure all categories have colors
        let updated = false;
        currentPeriodData.transactions.forEach((transaction: { category: string; color?: string }) => {
          if (!transaction.color) {
            transaction.color = generateColor();
            updated = true;
          }
        });

        // Save updates if colors were added
        if (updated) {
          await updateDoc(userRef, { reports });
        }
      }

      // Get category names and colors from the transactions
      const categoriesWithColors = currentPeriodData.transactions.map(
        (transaction: { category: string; color: string }) => ({
          category: transaction.category,
          color: transaction.color,
        })
      );

      return res.status(200).json({ categories: categoriesWithColors });
    } catch (error) {
      console.error('Error fetching categories:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  else if (req.method === 'POST') {
    try {
      const { userId, period } = req.query
      const { newCategory } = req.body

      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ message: 'User ID is required' })
      }

      if (!period || typeof period !== 'string') {
        return res.status(400).json({ message: 'Period is required' })
      }

      if (!newCategory || typeof newCategory !== 'string') {
        return res.status(400).json({ message: 'New category is required' })
      }

      // Get user document from Firestore
      const userRef = doc(db, 'users', userId)
      const userSnap = await getDoc(userRef)

      if (!userSnap.exists()) {
        return res.status(404).json({ message: 'User not found' })
      }

      const userData = userSnap.data()
      const reports = [...userData.reports]

      // Find the index of the period we want to update
      const periodIndex = reports.findIndex(
        (report: { period: string }) => report.period === period
      )

      if (periodIndex === -1) {
        return res.status(404).json({ message: 'Period not found' })
      }

      // Check if category already exists
      const categoryExists = reports[periodIndex].transactions.some(
        (transaction: { category: string }) => transaction.category === newCategory
      )

      if (categoryExists) {
        return res.status(400).json({ message: 'Category already exists' })
      }

      // Add new category to transactions
      reports[periodIndex].transactions.push({
        category: newCategory,
        color: generateColor(),
        expenses: []
      })

      // Update the document
      await updateDoc(userRef, { reports })

      return res.status(200).json({ message: 'Category added successfully' })

    } catch (error) {
      console.error('Error adding category:', error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }
  else {
    return res.status(405).json({ message: 'Method not allowed' })
  }
}
