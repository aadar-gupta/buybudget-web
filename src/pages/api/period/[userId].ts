import { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { DEFAULT_CATEGORIES } from '@/constants/categories'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { userId } = req.query

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ message: 'User ID is required' })
    }

    // Get user document from Firestore
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      return res.status(404).json({ message: 'User not found' })
    }

    const userData = userSnap.data()
    const reports = [...(userData.reports || [])]

    const currentPeriod = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

    // Check if current period exists
    const currentPeriodExists = reports.some(report => report.period === currentPeriod)

    // If current period doesn't exist, create it
    if (!currentPeriodExists) {
      reports.push({
        period: currentPeriod,
        budget: 0,
        transactions: [...DEFAULT_CATEGORIES]
      })

      // Update the document with new period
      await updateDoc(userRef, { reports })
    }

    // Extract and sort periods
    const periods = reports
      .map(report => report.period)
      .sort((a, b) => {
        const dateA = new Date(a)
        const dateB = new Date(b)
        return dateB.getTime() - dateA.getTime() // Sort in descending order (newest first)
      })

    return res.status(200).json(periods)

  } catch (error) {
    console.error('Error fetching periods:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
