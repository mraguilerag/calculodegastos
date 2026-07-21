import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '../../store/useAppStore'
import { computeTotals, formatMoney } from '../../lib/dates'
import { getPeriodRange, getElapsedDays, daysInRange } from '../../lib/periods'
import { useCurrency } from '../../hooks/useCurrency'
import { GlassCard } from '../ui/GlassCard'
import { Button } from '../ui/Button'
import { BudgetDialog } from './BudgetDialog'
import { useToast } from '../ui/ToastProvider'
import { sound } from '../../lib/sound'

export function BudgetWidget() {
  const expenses = useAppStore((s) => s.expenses)
  const budget = useAppStore((s) => s.budget)
  const setMonthlyLimit = useAppStore((s) => s.setMonthlyLimit)
  const { showToast } = useToast()
  const currency = useCurrency()
  const [open, setOpen] = useState(false)

  const spent = useMemo(() => computeTotals(expenses).month, [expenses])
  const limit = budget.monthlyLimit
  const pct = limit ? Math.min(100, Math.round((spent / limit) * 100)) : 0
  const over = limit !== null && spent > limit

  const projection = useMemo(() => {
    const monthRange = getPeriodRange('month', 0)
    const elapsedDays = getElapsedDays(monthRange)
    const totalDays = daysInRange(monthRange)
    if (spent <= 0 || elapsedDays >= totalDays) return null
    return (spent / elapsedDays) * totalDays
  }, [spent])

  function handleSave(value: number | null) {
    try {
      setMonthlyLimit(value)
      setOpen(false)
      sound.save()
      showToast('Presupuesto actualizado', { icon: '✓' })
    } catch (err) {
      sound.error()
      showToast(err instanceof Error ? err.message : 'No se pudo actualizar el presupuesto.', { variant: 'error' })
    }
  }

  return (
    <GlassCard padding="lg" tilt={false}>
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-semibold text-ink-900 dark:text-pink-50">Presupuesto mensual</h2>
        <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => setOpen(true)}>
          {limit === null ? 'Definir' : 'Editar'}
        </Button>
      </div>

      {limit === null ? (
        <div className="mt-4">
          <p className="text-sm text-ink-500 dark:text-pink-200/60">Todavia no defines un presupuesto mensual.</p>
          {projection !== null && (
            <p className="mt-2 text-xs font-heading font-medium text-ink-500 dark:text-pink-200/60">
              Al ritmo actual, terminarás el mes con ~{formatMoney(projection, currency)}
            </p>
          )}
        </div>
      ) : (
        <div className="mt-4">
          <div className="flex justify-between text-sm font-heading font-medium text-ink-700 dark:text-pink-100/80">
            <span>Gastado: {formatMoney(spent, currency)}</span>
            <span>Limite: {formatMoney(limit, currency)}</span>
          </div>

          <div className="mt-2 h-4 overflow-hidden rounded-full bg-white/60 dark:bg-night-900/60 shadow-[inset_0_1px_3px_rgba(184,91,143,0.18)]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 22 }}
              className={
                over
                  ? 'h-full rounded-full bg-gradient-to-r from-rose-400 to-rose-600'
                  : 'h-full rounded-full bg-gradient-to-r from-pink-300 to-gold-400'
              }
            />
          </div>

          <p className="mt-2 text-xs font-heading font-medium text-ink-500 dark:text-pink-200/60">
            {over ? 'Superaste el limite mensual' : `${pct}% del presupuesto usado`}
          </p>

          {projection !== null && (
            <p
              className={`mt-1 text-xs font-heading font-medium ${
                projection > limit ? 'text-rose-500 dark:text-rose-300' : 'text-ink-500 dark:text-pink-200/60'
              }`}
            >
              Al ritmo actual, terminarás con ~{formatMoney(projection, currency)}
            </p>
          )}
        </div>
      )}

      <BudgetDialog open={open} currentValue={limit} onClose={() => setOpen(false)} onSave={handleSave} />
    </GlassCard>
  )
}
