import { useEffect, useRef, useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '../../store/useAppStore'
import { todayISO, addMonthsToISO } from '../../lib/dates'
import { GlassCard } from '../ui/GlassCard'
import { Field, inputClasses } from '../ui/Field'
import { Button } from '../ui/Button'
import { CategoryPicker } from './CategoryPicker'
import { CategoryFormDialog } from './CategoryFormDialog'
import { ManageCategoriesDialog } from './ManageCategoriesDialog'
import { useToast } from '../ui/ToastProvider'
import { sound } from '../../lib/sound'
import { useCurrency } from '../../hooks/useCurrency'
import { parseAmountInput, amountErrorMessage } from '../../lib/amount'
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
  const [amountError, setAmountError] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(todayISO())
  const [categoryId, setCategoryId] = useState<string | null>(categories[0]?.id ?? null)
  const [newCategoryOpen, setNewCategoryOpen] = useState(false)
  const [manageOpen, setManageOpen] = useState(false)
  const [justSaved, setJustSaved] = useState(false)
  const [repeatEnabled, setRepeatEnabled] = useState(false)
  const [repeatMonths, setRepeatMonths] = useState('3')

  useEffect(() => {
    if (categoryId && !categories.some((c) => c.id === categoryId)) {
      setCategoryId(null)
    }
  }, [categories, categoryId])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const parsedAmount = parseAmountInput(amount, currency)
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      sound.error()
      setAmountError(amountErrorMessage(currency))
      return
    }

    const installments = repeatEnabled ? Math.round(Number(repeatMonths)) : 1
    if (repeatEnabled && (!Number.isFinite(installments) || installments < 2 || installments > 60)) {
      sound.error()
      showToast('La cantidad de cuotas debe ser entre 2 y 60.', { variant: 'error', icon: '!' })
      return
    }

    try {
      if (installments > 1) {
        for (let i = 0; i < installments; i++) {
          const installmentDate = addMonthsToISO(date, i)
          const installmentDescription = description
            ? `${description} (cuota ${i + 1}/${installments})`
            : `Cuota ${i + 1}/${installments}`
          await addExpense({ amount: parsedAmount, categoryId, description: installmentDescription, date: installmentDate })
        }
        showToast(`${installments} cuotas guardadas`, { icon: '✓', variant: 'success' })
      } else {
        await addExpense({ amount: parsedAmount, categoryId, description, date })
        showToast('Gasto guardado', { icon: '✓', variant: 'success' })
      }
      setAmount('')
      setDescription('')
      setDate(todayISO())
      setRepeatEnabled(false)
      setRepeatMonths('3')
      sound.check()
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

  async function handleCreateCategory(input: { name: string; color: string; icon: string }) {
    try {
      const cat = await addCategory(input)
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
        <Field label="Monto" htmlFor="expense-amount">
          <div className="relative">
            <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 font-heading text-2xl font-bold text-pink-500 sm:text-3xl">
              {currency.symbol}
            </span>
            <input
              id="expense-amount"
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value)
                if (amountError) setAmountError(null)
              }}
              placeholder="0"
              aria-invalid={amountError !== null}
              aria-describedby={amountError ? 'expense-amount-error' : undefined}
              className={`${inputClasses} py-4 text-3xl font-heading font-bold sm:text-4xl`}
              style={{ paddingLeft: `${2.4 + currency.symbol.length * 0.7}rem` }}
            />
          </div>
          {amountError && (
            <p id="expense-amount-error" className="mt-1.5 pl-1 text-sm font-medium text-rose-600 dark:text-rose-300">
              {amountError}
            </p>
          )}
        </Field>

        <Field label="Categoria" htmlFor="category-picker">
          <div id="category-picker">
            <CategoryPicker
              categories={categories}
              selectedId={categoryId}
              onSelect={setCategoryId}
              onRequestNew={() => setNewCategoryOpen(true)}
              onRequestManage={() => setManageOpen(true)}
            />
          </div>
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Fecha" htmlFor="expense-date">
            <input
              id="expense-date"
              type="date"
              value={date}
              max={todayISO()}
              onChange={(e) => setDate(e.target.value)}
              className={`${inputClasses} text-sm`}
            />
          </Field>

          <Field label="Descripcion (opcional)" htmlFor="expense-desc">
            <input
              id="expense-desc"
              type="text"
              maxLength={60}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ej: café con María"
              className={`${inputClasses} text-sm`}
            />
          </Field>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 rounded-2xl bg-white/40 dark:bg-night-900/30 px-3.5 py-2.5">
          <label className="inline-flex items-center gap-2 text-xs font-heading font-medium text-ink-600 dark:text-pink-100/80">
            <input
              type="checkbox"
              checked={repeatEnabled}
              onChange={(e) => {
                sound.click()
                setRepeatEnabled(e.target.checked)
              }}
              className="h-4 w-4 rounded accent-pink-500"
            />
            Repetir este gasto los próximos
          </label>
          <input
            type="number"
            min={2}
            max={60}
            step={1}
            disabled={!repeatEnabled}
            value={repeatMonths}
            onChange={(e) => setRepeatMonths(e.target.value)}
            className="w-14 rounded-lg border-2 border-transparent bg-white/70 dark:bg-night-900/50 px-2 py-1 text-center text-xs font-heading font-semibold text-ink-900 dark:text-pink-50 focus:outline-none focus:border-pink-400 disabled:opacity-40"
          />
          <span className="text-xs font-heading font-medium text-ink-600 dark:text-pink-100/80">meses (cuotas)</span>
        </div>

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

      <CategoryFormDialog
        open={newCategoryOpen}
        mode="create"
        onClose={() => setNewCategoryOpen(false)}
        onSubmit={handleCreateCategory}
      />
      <ManageCategoriesDialog open={manageOpen} onClose={() => setManageOpen(false)} />
      {portal}
    </GlassCard>
  )
}
