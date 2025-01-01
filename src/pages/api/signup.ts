import type { NextApiRequest, NextApiResponse } from 'next';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { DEFAULT_CATEGORIES } from '@/constants/categories';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, fullName, location } = req.body;

  try {
    // Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const userId = userCredential.user.uid;

    const today = new Date();
  const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };

    // Save additional profile data in Firestore
    const userProfile = {
      profile: {
        name: fullName,
        country: location.country,
        email,
      },
      reports: [{
        period: today.toLocaleDateString('en-US', options),
        budget: 0,
        transactions: [
          ...DEFAULT_CATEGORIES
        ],
      }]
    };

    await setDoc(doc(db, 'users', userId), userProfile);

    return res.status(201).json({ message: 'User created successfully', userId });
  } catch (error: any) {
    console.error('Error in /api/signup:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
