'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-emerald-500 mb-4">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-slate-200 mb-4">
            Page Not Found
          </h2>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>

          <Link
            href="/dashboard"
            className={cn(
              "inline-flex items-center gap-2 px-6 py-3 rounded-lg",
              "bg-gradient-to-r from-blue-600 to-emerald-600",
              "hover:from-blue-500 hover:to-emerald-500",
              "text-white shadow-lg transition-all duration-300",
              "border border-white/10"
            )}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </motion.div>
      </div>
    </main>
  )
}
