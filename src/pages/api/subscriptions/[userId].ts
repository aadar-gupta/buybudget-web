import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const { userId } = req.query;
      const { start, amount, frequency, note } = req.body;

      // Validate input
      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ message: 'User ID is required' });
      }

      if (!start || typeof start !== 'string') {
        return res.status(400).json({ message: 'Start date is required' });
      }

      if (!amount || typeof amount !== 'number') {
        return res.status(400).json({ message: 'Amount is required and must be a number' });
      }

      if (!frequency || typeof frequency !== 'string') {
        return res.status(400).json({ message: 'Frequency is required' });
      }

      // Parse and validate start date
      const startDate = new Date(start);
      if (isNaN(startDate.getTime())) {
        return res.status(400).json({ message: 'Invalid date format for start date' });
      }

      // Fetch user document
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return res.status(404).json({ message: 'User not found' });
      }

      const userData = userSnap.data();
      const subscriptions = userData.subscriptions ? [...(userData.subscriptions)] : [];

      // Add the new subscription
      const newSubscription = {
        start,
        amount,
        frequency,
        note: note || '',
      };
      subscriptions.push(newSubscription);

      // Update the document
      await updateDoc(userRef, { subscriptions });

      return res.status(200).json({ message: 'Subscription added successfully' });
    } catch (error) {
      console.error('Error adding subscription:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
