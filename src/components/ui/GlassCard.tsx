import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useTilt } from '../../hooks/useTilt'
import { cn } from '../../lib/cn'

interface GlassCardProps {
  children: ReactNode
  className?: string
  tilt?: boolean
  padding?: 'sm' | 'md' | 'lg'
}

const paddingMap = {
  sm: 'p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
}

export function GlassCard({ children, className, tilt = true, padding = 'md' }: GlassCardProps) {
  const { style, handlers } = useTilt()

  return (
    <motion.div
      {...(tilt ? handlers : {})}
      style={tilt ? style : undefined}
      className={cn(
        'relative rounded-3xl border border-white/60 dark:border-white/10',
        'bg-gradient-to-br from-white/70 via-white/45 to-pink-100/40',
        'dark:from-night-700/70 dark:via-night-800/55 dark:to-night-900/50',
        'backdrop-blur-xl shadow-[var(--shadow-glass)]',
        "before:pointer-events-none before:absolute before:inset-x-6 before:top-0 before:h-px",
        'before:bg-gradient-to-r before:from-transparent before:via-white/80 before:to-transparent',
        'dark:before:via-white/25',
        paddingMap[padding],
        className
      )}
    >
      {children}
    </motion.div>
  )
}
