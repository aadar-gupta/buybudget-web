import { cn } from '@/lib/utils'

interface GradientTitleProps {
  children: React.ReactNode
  className?: string
}

export function GradientTitle({ children, className }: GradientTitleProps) {
  return (
    <h1
      className={cn(
        "text-5xl md:text-6xl font-bold tracking-tight pb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-emerald-400 to-blue-400",
        className
      )}
    >
      {children}
    </h1>
  )
}
