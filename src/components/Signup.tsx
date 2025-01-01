'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GradientTitle } from './ui/GradientTitle'
import { UserInput } from './ui/UserInput'
import { GradientButton } from './ui/GradientButton'
import { LocationCurrencyInput } from './ui/LocationCurrencyInput'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from "@/lib/firebase";
import { setCookie } from 'nookies'
import { Loader2 } from 'lucide-react';

export function Signup() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    location: {
      country: '',
      currency: ''
    }
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          location: formData.location,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Something went wrong');
      }

      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const userId = userCredential.user.uid;

      // Set a cookie with the signed-in user's ID
      setCookie(null,'userId', userId, {
        httpOnly: false,
        secure: true,
        path: '/',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });

      router.push('/'); // Redirect on success
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 pt-24 pb-32">
        {/* Decorative elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-1/2 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-10" />
          <div className="absolute -bottom-1/2 left-0 w-96 h-96 bg-emerald-500 rounded-full blur-3xl opacity-10" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl mx-auto"
        >
          <GradientTitle className="text-4xl md:text-5xl text-center mb-8">
            Create Account
          </GradientTitle>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 bg-slate-900/50 p-8 rounded-xl backdrop-blur-sm border border-slate-800"
          >
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-lg">
                {error}
              </div>
            )}

            <UserInput
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              required
              disabled={loading}
            />
            <UserInput
              label="Email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
              disabled={loading}
            />
            <UserInput
              label="Password"
              type="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              required
              minLength={6}
              disabled={loading}
            />

            <LocationCurrencyInput
              onLocationChange={(location) =>
                setFormData(prev => ({ ...prev, location }))
              }
            />

            <GradientButton
              type="submit"
              className="w-full justify-center"
              disabled={loading}
            >
              {loading ? (
                'Creating Account...'
              ) : (
                'Create Account'
              )}
            </GradientButton>

            <p className="text-center text-slate-400">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </form>

          {loading && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-20">
              <Loader2 className="w-12 h-12 animate-spin text-slate-400" />
            </div>
          )}
        </motion.div>
      </div>
    </main>
  )
}
