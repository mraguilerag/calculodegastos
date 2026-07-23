import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { AppBackground } from './AppBackground'

export function CenteredScreen({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <AppBackground />
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        className="relative z-10 w-full max-w-md"
      >
        {children}
      </motion.div>
    </div>
  )
}
