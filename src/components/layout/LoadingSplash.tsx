import { motion } from 'framer-motion'
import { AppBackground } from './AppBackground'

export function LoadingSplash() {
  return (
    <div className="relative flex min-h-screen items-center justify-center">
      <AppBackground />
      <motion.span
        className="relative z-10 text-4xl"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden
      >
        💗
      </motion.span>
    </div>
  )
}
