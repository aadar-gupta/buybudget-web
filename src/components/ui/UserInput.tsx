'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface UserInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export const UserInput = React.forwardRef<HTMLInputElement, UserInputProps>(
  ({ label, className, ...props }, ref) => {
    return (
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          {label}
        </label>
        <input
          ref={ref}
          className={cn(
            "w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500",
            className
          )}
          {...props}
        />
      </div>
    )
  }
)

UserInput.displayName = 'UserInput'
