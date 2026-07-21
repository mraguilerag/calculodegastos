import { AnimatePresence, motion } from 'framer-motion'
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { cn } from '../../lib/cn'

type ToastVariant = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  message: string
  variant: ToastVariant
  icon?: string
}

interface ToastContextValue {
  showToast: (message: string, options?: { variant?: ToastVariant; icon?: string }) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const variantAccent: Record<ToastVariant, string> = {
  success: 'border-pink-300/70',
  error: 'border-rose-300/70',
  info: 'border-lavender-300/70',
}

const variantDefaultIcon: Record<ToastVariant, string> = {
  success: '✓',
  error: '✕',
  info: '•',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const counter = useRef(0)

  const showToast = useCallback<ToastContextValue['showToast']>((message, options) => {
    const id = counter.current++
    const variant = options?.variant ?? 'success'
    setToasts((prev) => [...prev, { id, message, variant, icon: options?.icon }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 2800)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex flex-col items-center gap-2 px-4"
        role="status"
        aria-live="polite"
      >
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 16, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96, transition: { duration: 0.18 } }}
              transition={{ type: 'spring', stiffness: 340, damping: 26 }}
              className={cn(
                'pointer-events-auto flex items-center gap-2.5 rounded-2xl border bg-white/85 dark:bg-night-800/85',
                'backdrop-blur-xl px-4 py-3 shadow-[var(--shadow-glass-lg)] max-w-sm',
                variantAccent[toast.variant]
              )}
            >
              <span className="text-lg leading-none" aria-hidden>
                {toast.icon ?? variantDefaultIcon[toast.variant]}
              </span>
              <span className="font-heading text-sm font-medium text-ink-900 dark:text-pink-50">
                {toast.message}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de ToastProvider')
  return ctx
}
