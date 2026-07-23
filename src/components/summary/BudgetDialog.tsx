import { AnimatePresence, motion } from 'framer-motion'
import { createPortal } from 'react-dom'
import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '../ui/Button'
import { Field, inputClasses } from '../ui/Field'
import { useCurrency } from '../../hooks/useCurrency'
import { parseAmountInput, amountErrorMessage } from '../../lib/amount'

interface BudgetDialogProps {
  open: boolean
  currentValue: number | null
  onClose: () => void
  onSave: (value: number | null) => void
}

export function BudgetDialog({ open, currentValue, onClose, onSave }: BudgetDialogProps) {
  const currency = useCurrency()
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setValue(currentValue !== null ? String(currentValue) : '')
      setError(null)
    }
  }, [open, currentValue])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (value.trim() === '') {
      onSave(null)
      return
    }
    const parsed = parseAmountInput(value, currency)
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError(amountErrorMessage(currency))
      return
    }
    onSave(parsed)
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-ink-900/35 dark:bg-black/55 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.form
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 8 }}
            transition={{ type: 'spring', stiffness: 340, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
            role="dialog"
            aria-modal="true"
            aria-label="Presupuesto mensual"
            className="w-full max-w-sm rounded-3xl border border-white/70 dark:border-white/10 bg-white/90 dark:bg-night-800/90 backdrop-blur-xl p-6 shadow-[var(--shadow-glass-lg)]"
          >
            <h2 className="font-heading text-lg font-semibold text-ink-900 dark:text-pink-50">Presupuesto mensual</h2>
            <p className="mt-1 text-sm text-ink-500 dark:text-pink-200/60">
              Define un limite de gasto mensual para seguir tu progreso. Dejalo vacio para quitarlo.
            </p>

            <Field label="Monto" htmlFor="budget-amount" className="mt-4">
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-heading text-pink-500">
                  {currency.symbol}
                </span>
                <input
                  id="budget-amount"
                  type="text"
                  inputMode="decimal"
                  autoFocus
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value)
                    if (error) setError(null)
                  }}
                  placeholder="ej: 400"
                  aria-invalid={error !== null}
                  className={inputClasses}
                  style={{ paddingLeft: `${1.6 + currency.symbol.length * 0.5}rem` }}
                />
              </div>
              {error && <p className="mt-1.5 pl-1 text-sm font-medium text-rose-600 dark:text-rose-300">{error}</p>}
            </Field>

            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">Guardar</Button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
