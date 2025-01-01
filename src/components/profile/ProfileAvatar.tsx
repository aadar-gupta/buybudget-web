'use client'

import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface ProfileAvatarProps {
  name: string
}

export function ProfileAvatar({ name }: ProfileAvatarProps) {
  const router = useRouter()

  const getInitials = (name: string) => {
    const names = name.trim().split(' ')
    if (names.length >= 2) {
      return `${names[0].trim()[0]}${names[names.length - 1].trim()[0]}`.toUpperCase()
    } else if (names.length >= 1) {
        return (name.trim()[0] || '').toUpperCase()
    } else {
      return ''
    }
  }

  return (
    <button
      onClick={() => router.push('/profile')}
      className={cn(
        "w-20 h-20 rounded-full flex items-center justify-center",
        "text-3xl font-medium text-white transition-transform",
        "hover:scale-110 focus:outline-none focus:ring-2",
        "focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900",
        "bg-gradient-to-r from-blue-500 via-emerald-500 to-blue-500 hover:from-blue-400 hover:to-emerald-400"
      )}
    >
      {getInitials(name)}
    </button>
  )
}
