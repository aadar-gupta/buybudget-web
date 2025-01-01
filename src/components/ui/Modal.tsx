'use client'

import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
}

export function Modal({ isOpen, onClose, children, className }: ModalProps) {
  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className={cn(
          "bg-slate-900/95 border border-slate-800 rounded-2xl shadow-xl",
          "overflow-y-auto max-h-[90vh]",
          className
        )}>
          {children}
        </div>
      </div>
    </>
  )
}
