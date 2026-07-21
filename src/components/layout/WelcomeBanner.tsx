import { AnimatePresence, motion } from 'framer-motion'
import { createPortal } from 'react-dom'
import { useEffect } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { Button } from '../ui/Button'

export function WelcomeBanner() {
  const hasSeenWelcome = useAppStore((s) => s.settings.hasSeenWelcome)
  const dismissWelcome = useAppStore((s) => s.dismissWelcome)
  const open = !hasSeenWelcome

  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') dismissWelcome()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, dismissWelcome])

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-ink-900/20 dark:bg-black/40 backdrop-blur-sm p-4"
          onClick={dismissWelcome}
          role="presentation"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 8 }}
            transition={{ type: 'spring', stiffness: 340, damping: 26 }}
            role="dialog"
            aria-modal="false"
            aria-labelledby="welcome-banner-title"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-3xl border border-white/70 dark:border-white/10 bg-white/90 dark:bg-night-800/90 backdrop-blur-xl p-6 text-center shadow-[var(--shadow-glass-lg)]"
          >
            <button
              type="button"
              onClick={dismissWelcome}
              aria-label="Cerrar"
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-pink-100 hover:text-pink-700 dark:text-pink-200/50 dark:hover:bg-white/10 dark:hover:text-pink-200"
            >
              ✕
            </button>

            <span className="text-3xl" aria-hidden>
              💗
            </span>
            <h2
              id="welcome-banner-title"
              className="mt-2 font-heading text-lg font-semibold text-ink-900 dark:text-pink-50"
            >
              Te damos la bienvenida a Mis Gastos
            </h2>
            <p className="mt-2 text-sm text-ink-500 dark:text-pink-200/70">
              Un lugar simple y bonito para llevar tus finanzas del día a día.
            </p>

            <Button onClick={dismissWelcome} className="mt-6 w-full">
              Comenzar
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
