import { AnimatePresence, motion } from 'framer-motion'
import { createPortal } from 'react-dom'
import { useEffect, useState, type FormEvent } from 'react'
import type { Category, Expense } from '../../types'
import { Button } from '../ui/Button'
import { Field, inputClasses } from '../ui/Field'
import { todayISO } from '../../lib/dates'
import { useCurrency } from '../../hooks/useCurrency'
import { amountInputProps } from '../../data/currencies'

interface EditExpenseDialogProps {
  expense: Expense | null
  categories: Category[]
  onClose: () => void
  onSave: (id: string, patch: { amount: string; categoryId: string; description: string; date: string }) => void
}

export function EditExpenseDialog({ expense, categories, onClose, onSave }: EditExpenseDialogProps) {
  const currency = useCurrency()
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')

  useEffect(() => {
    if (expense) {
      setAmount(String(expense.amount))
      setCategoryId(expense.categoryId)
      setDescription(expense.description)
      setDate(expense.date)
    }
  }, [expense])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!expense) return
    onSave(expense.id, { amount, categoryId, description, date })
  }

  return createPortal(
    <AnimatePresence>
      {expense && (
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
            aria-label="Editar gasto"
            className="w-full max-w-sm rounded-3xl border border-white/70 dark:border-white/10 bg-white/90 dark:bg-night-800/90 backdrop-blur-xl p-6 shadow-[var(--shadow-glass-lg)]"
          >
            <h2 className="font-heading text-lg font-semibold text-ink-900 dark:text-pink-50">Editar gasto</h2>

            <div className="mt-4 flex flex-col gap-4">
              <Field label="Monto" htmlFor="edit-amount">
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-heading text-pink-500">
                    {currency.symbol}
                  </span>
                  <input
                    id="edit-amount"
                    type="number"
                    step={amountInputProps(currency).step}
                    min={amountInputProps(currency).min}
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={inputClasses}
                    style={{ paddingLeft: `${1.6 + currency.symbol.length * 0.5}rem` }}
                  />
                </div>
              </Field>

              <Field label="Categoria" htmlFor="edit-category">
                <select
                  id="edit-category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className={inputClasses}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Descripcion" htmlFor="edit-desc">
                <input
                  id="edit-desc"
                  type="text"
                  maxLength={60}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={inputClasses}
                />
              </Field>

              <Field label="Fecha" htmlFor="edit-date">
                <input
                  id="edit-date"
                  type="date"
                  value={date}
                  max={todayISO()}
                  onChange={(e) => setDate(e.target.value)}
                  className={inputClasses}
                />
              </Field>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">Guardar cambios</Button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
