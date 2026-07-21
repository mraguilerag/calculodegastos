import { useRef, useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '../../store/useAppStore'
import { todayISO } from '../../lib/dates'
import { GlassCard } from '../ui/GlassCard'
import { Field, inputClasses } from '../ui/Field'
import { Button } from '../ui/Button'
import { CategoryPicker } from './CategoryPicker'
import { NewCategoryDialog } from './NewCategoryDialog'
import { useToast } from '../ui/ToastProvider'
import { sound } from '../../lib/sound'
import { useCurrency } from '../../hooks/useCurrency'
import { useHeartBurst } from '../ui/HeartBurst'

export function ExpenseForm() {
  const categories = useAppStore((s) => s.categories)
  const addExpense = useAppStore((s) => s.addExpense)
  const addCategory = useAppStore((s) => s.addCategory)
  const { showToast } = useToast()
  const currency = useCurrency()
  const { burst, portal } = useHeartBurst()
  const submitWrapRef = useRef<HTMLDivElement>(null)

  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(todayISO())
  const [categoryId, setCategoryId] = useState<string | null>(categories[0]?.id ?? null)
  const [newCategoryOpen, setNewCategoryOpen] = useState(false)
  const [justSaved, setJustSaved] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    try {
      addExpense({ amount, categoryId: categoryId ?? '', description, date })
      setAmount('')
      setDescription('')
      setDate(todayISO())
      sound.check()
      showToast('Gasto guardado', { icon: '✓', variant: 'success' })
      burst(submitWrapRef.current)
      setJustSaved(true)
      setTimeout(() => setJustSaved(false), 500)
    } catch (err) {
      sound.error()
      showToast(err instanceof Error ? err.message : 'No se pudo guardar el gasto.', {
        variant: 'error',
        icon: '!',
      })
    }
  }

  function handleCreateCategory(input: { name: string; color: string; icon: string }) {
    try {
      const cat = addCategory(input)
      setCategoryId(cat.id)
      setNewCategoryOpen(false)
      sound.save()
      showToast('Categoria creada', { icon: '✓' })
    } catch (err) {
      sound.error()
      showToast(err instanceof Error ? err.message : 'No se pudo crear la categoria.', { variant: 'error' })
    }
  }

  return (
    <GlassCard padding="lg" tilt={false}>
      <h2 className="font-heading text-xl font-semibold text-ink-900 dark:text-pink-50">Nuevo gasto</h2>

      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Monto" htmlFor="expense-amount">
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-heading text-pink-500">
                {currency.symbol}
              </span>
              <input
                id="expense-amount"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className={`${inputClasses} font-heading text-lg`}
                style={{ paddingLeft: `${1.6 + currency.symbol.length * 0.5}rem` }}
              />
            </div>
          </Field>

          <Field label="Fecha" htmlFor="expense-date">
            <input
              id="expense-date"
              type="date"
              value={date}
              max={todayISO()}
              onChange={(e) => setDate(e.target.value)}
              className={inputClasses}
            />
          </Field>
        </div>

        <Field label="Categoria" htmlFor="category-picker">
          <div id="category-picker">
            <CategoryPicker
              categories={categories}
              selectedId={categoryId}
              onSelect={setCategoryId}
              onRequestNew={() => setNewCategoryOpen(true)}
            />
          </div>
        </Field>

        <Field label="Descripcion (opcional)" htmlFor="expense-desc">
          <input
            id="expense-desc"
            type="text"
            maxLength={60}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="ej: cafe con Karina"
            className={inputClasses}
          />
        </Field>

        <motion.div
          ref={submitWrapRef}
          animate={justSaved ? { scale: [1, 1.04, 1] } : {}}
          transition={{ duration: 0.4 }}
        >
          <Button type="submit" className="w-full py-3.5 text-base" silent>
            Guardar gasto
          </Button>
        </motion.div>
      </form>

      <NewCategoryDialog
        open={newCategoryOpen}
        onClose={() => setNewCategoryOpen(false)}
        onCreate={handleCreateCategory}
      />
      {portal}
    </GlassCard>
  )
}
