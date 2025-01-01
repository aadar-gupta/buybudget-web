import { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { DEFAULT_CATEGORIES } from '@/constants/categories'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId, period } = req.query

  if (!userId) {
    return res.status(400).json({
      message: 'Missing required field: userId is required'
    })
  }

  // Get user document
  const userRef = doc(db, 'users', userId as string)
  const userDoc = await getDoc(userRef)

  if (!userDoc.exists()) {
    return res.status(404).json({ message: 'User not found' })
  }

  const userData = userDoc.data()
  const reports = userData.reports || []

  if (req.method === 'GET') {
    try {
      if (!period) {
        return res.status(400).json({
          message: 'Missing required field: period is required'
        })
      }

      // Find the report for the specified period
      let report = reports.find((r: any) => r.period === period)

      // If no report exists, create one with default budget of 0
      if (!report) {
        report = {
          period,
          budget: 0,
          transactions: [...DEFAULT_CATEGORIES]
        }
        reports.push(report)

        // Update the user document with the new report
        await updateDoc(userRef, {
          reports: reports
        })
      }

      return res.status(200).json({
        budget: report.budget
      })

    } catch (error) {
      console.error('Error fetching budget:', error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  if (req.method === 'PUT') {
    try {
      const { budget } = req.body

      if (!budget || !period) {
        return res.status(400).json({
          message: 'Missing required fields: budget and period are required'
        })
      }

      // Validate budget is a positive number
      const budgetValue = parseFloat(budget)
      if (isNaN(budgetValue) || budgetValue < 0) {
        return res.status(400).json({
          message: 'Budget must be a positive number'
        })
      }

      // Find the report for the specified period
      const reportIndex = reports.findIndex((report: any) => report.period === period)

      if (reportIndex === -1) {
        // If no report exists, create one
        reports.push({
          period,
          budget: budgetValue,
          transactions: [...DEFAULT_CATEGORIES]
        })
      } else {
        // Update existing report
        reports[reportIndex] = {
          ...reports[reportIndex],
          budget: budgetValue
        }
      }

      // Update the user document
      await updateDoc(userRef, {
        reports: reports
      })

      return res.status(200).json({
        message: 'Budget updated successfully',
        budget: budgetValue
      })

    } catch (error) {
      console.error('Error updating budget:', error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
