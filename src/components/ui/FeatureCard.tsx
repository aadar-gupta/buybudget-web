'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface FeatureCardProps {
  title: string
  description: string
  icon: LucideIcon
  className?: string
  iconColor?: string
  delay?: number
}

export function FeatureCard({
  title,
  description,
  icon: Icon,
  className,
  iconColor = "text-blue-400",
  delay = 0
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className={cn(
        "bg-slate-900/50 backdrop-blur-sm p-6 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors",
        className
      )}
    >
      <div className="bg-blue-500/10 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
        <Icon className={cn("w-7 h-7", iconColor)} />
      </div>
      <h3 className="text-xl font-semibold mb-2 text-slate-200">{title}</h3>
      <p className="text-slate-400">{description}</p>
    </motion.div>
  )
}
