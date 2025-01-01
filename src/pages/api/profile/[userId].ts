import { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId } = req.query

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

  if (req.method === 'GET') {
    try {
      // Return the profile data
      const profile = {
        name: userData.profile.name || '',
        email: userData.profile.email || '',
        country: userData.profile.country || ''
      }

      return res.status(200).json(profile)

    } catch (error) {
      console.error('Error fetching profile:', error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  if (req.method === 'PUT') {
    try {
      const { name, country } = req.body

      if (!name && !country) {
        return res.status(400).json({
          message: 'At least one field (name or currency) is required to update the profile'
        })
      }

      const updatedProfile: Record<string, any> = {}
      if (name) updatedProfile['profile.name'] = name
      if (country) updatedProfile['profile.country'] = country

      // Update the user document
      await updateDoc(userRef, updatedProfile)

      return res.status(200).json({
        message: 'Profile updated successfully',
        profile: updatedProfile
      })

    } catch (error) {
      console.error('Error updating profile:', error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
