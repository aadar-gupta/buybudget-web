'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ArrowLeft, LogOut, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { signOut } from 'firebase/auth'
import { destroyCookie, parseCookies } from 'nookies'
import { GradientButton } from '@/components/ui/GradientButton'

const currencies = [
  { code: 'CAD', symbol: '$' },
  { code: 'USD', symbol: '$' },
]

const countryToCurrency = {
  Canada: 'CAD',
  'United States': 'USD',
}

const currencyToCountry = {
  CAD: 'Canada',
  USD: 'United States',
}

export function Profile() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false) // Track changes
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    preferredCurrency: '',
  })
  const [originalProfile, setOriginalProfile] = useState({}) // To compare changes

  useEffect(() => {
    const fetchProfile = async () => {
      const { userId } = parseCookies()
      try {
        const response = await fetch(`/api/profile/${userId}`)
        if (!response.ok) throw new Error("Failed to fetch profile")
        const data = await response.json()

        const countryKey = data.country as keyof typeof countryToCurrency
        const preferredCurrency = countryToCurrency[countryKey] || ''

        const fetchedProfile = {
          name: data.name || '',
          email: data.email || '',
          preferredCurrency,
        }

        setProfile(fetchedProfile)
        setOriginalProfile(fetchedProfile) // Store the initial profile
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setProfile((prev) => {
      const updatedProfile = { ...prev, [field]: value }
      // Compare to originalProfile to determine if changes were made
      setHasChanges(JSON.stringify(updatedProfile) !== JSON.stringify(originalProfile))
      return updatedProfile
    })
  }

  const handleSave = async () => {
    const { userId } = parseCookies()
    setIsSaving(true)
    try {
      const country = currencyToCountry[profile.preferredCurrency as keyof typeof currencyToCountry]

      const response = await fetch(`/api/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profile.name,
          country,
        }),
      })

      if (!response.ok) throw new Error("Failed to update profile")

      setOriginalProfile(profile) // Update originalProfile after saving
      setHasChanges(false) // Reset changes tracker
      router.push('/')
    } catch (error) {
      console.error("Error updating profile:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await signOut(auth)
      destroyCookie(null, 'userId', { path: '/' })
      router.push('/login')
    } catch (error) {
      console.error('Error logging out:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-slate-200">Profile Settings</h1>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg',
                'text-rose-500 hover:text-rose-400 transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <LogOut className="w-4 h-4" />
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={cn(
                  'w-full px-3 py-2 bg-slate-800/50 border border-slate-700',
                  'rounded-lg text-slate-200 focus:outline-none focus:ring-2',
                  'focus:ring-blue-500 focus:border-transparent'
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
              <input
                type="email"
                value={profile.email}
                disabled
                className={cn(
                  'w-full px-3 py-2 bg-slate-800/50 border border-slate-700',
                  'rounded-lg text-slate-200 focus:outline-none focus:ring-2',
                  'focus:ring-blue-500 focus:border-transparent',
                  'disabled:opacity-50'
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Preferred Currency</label>
              <select
                value={profile.preferredCurrency}
                onChange={(e) => handleInputChange('preferredCurrency', e.target.value)}
                className={cn(
                  'w-full px-3 py-2 bg-slate-800/50 border border-slate-700',
                  'rounded-lg text-slate-200 focus:outline-none focus:ring-2',
                  'focus:ring-blue-500 focus:border-transparent'
                )}
              >
                {currencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} ({currency.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end pt-4">
              <GradientButton
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className="disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </GradientButton>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
