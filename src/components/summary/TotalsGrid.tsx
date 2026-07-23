import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '../../store/useAppStore'
import { computeTotals, formatMoney } from '../../lib/dates'
import { useCurrency } from '../../hooks/useCurrency'
import { useConvert } from '../../hooks/useConvert'
import { GlassCard } from '../ui/GlassCard'

const PERIODS: Array<{ key: keyof ReturnType<typeof computeTotals>; label: string }> = [
  { key: 'today', label: 'Hoy' },
  { key: 'week', label: 'Esta semana' },
  { key: 'month', label: 'Este mes' },
  { key: 'year', label: 'Este ano' },
]

export function TotalsGrid() {
  const expenses = useAppStore((s) => s.expenses)
  const currency = useCurrency()
  const convert = useConvert()
  const convertedExpenses = useMemo(
    () => expenses.map((e) => ({ ...e, amount: convert(e.amount, e.currency) })),
    [expenses, convert]
  )
  const totals = useMemo(() => computeTotals(convertedExpenses), [convertedExpenses])

  return (
    <section
      className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
      aria-label="Resumen de gastos por periodo"
    >
      {PERIODS.map((period) => (
        <GlassCard key={period.key} padding="sm" className="flex flex-col items-center gap-1 text-center">
          <span className="font-heading text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-pink-200/60">
            {period.label}
          </span>
          <motion.span
            key={totals[period.key].toFixed(2)}
            initial={{ opacity: 0, y: -6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="font-heading text-xl font-semibold text-pink-600 dark:text-pink-300 sm:text-2xl"
          >
            {formatMoney(totals[period.key], currency)}
          </motion.span>
        </GlassCard>
      ))}
    </section>
  )
}
