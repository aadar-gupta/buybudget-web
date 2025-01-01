'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GradientButtonProps extends HTMLMotionProps<'button'> {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'outline'
}

export function GradientButton({
  children,
  className,
  variant = 'default',
  ...props
}: GradientButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "px-8 py-4 rounded-lg text-lg font-medium transition-all duration-200 inline-flex items-center gap-2",
        variant === 'default' &&
          "bg-gradient-to-r from-blue-500 to-emerald-500 text-white hover:from-blue-600 hover:to-emerald-600 shadow-lg shadow-emerald-500/20",
        variant === 'outline' &&
          "bg-transparent text-slate-200 border-2 border-slate-700 hover:border-slate-600",
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  )
}
