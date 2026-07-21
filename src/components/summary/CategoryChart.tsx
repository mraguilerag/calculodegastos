import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '../../store/useAppStore'
import { getMonthExpenses, getTotalsByCategory, formatMoney } from '../../lib/dates'
import { useCurrency } from '../../hooks/useCurrency'
import { GlassCard } from '../ui/GlassCard'

const SIZE = 168
const STROKE = 24
const RADIUS = (SIZE - STROKE) / 2

export function CategoryChart() {
  const expenses = useAppStore((s) => s.expenses)
  const categories = useAppStore((s) => s.categories)
  const currency = useCurrency()

  const entries = useMemo(() => {
    const monthExpenses = getMonthExpenses(expenses)
    const byCategory = getTotalsByCategory(monthExpenses)
    const total = Object.values(byCategory).reduce((a, b) => a + b, 0)
    if (total <= 0) return { total: 0, items: [] as Array<{ id: string; name: string; icon: string; color: string; amount: number; fraction: number; offset: number }> }

    let cumulative = 0
    const items = categories
      .map((cat) => ({ cat, amount: byCategory[cat.id] ?? 0 }))
      .filter((e) => e.amount > 0)
      .sort((a, b) => b.amount - a.amount)
      .map(({ cat, amount }) => {
        const fraction = amount / total
        const offset = cumulative
        cumulative += fraction
        return { id: cat.id, name: cat.name, icon: cat.icon, color: cat.color, amount, fraction, offset }
      })

    return { total, items }
  }, [expenses, categories])

  return (
    <GlassCard padding="lg" tilt={false}>
      <h2 className="font-heading text-xl font-semibold text-ink-900 dark:text-pink-50">Resumen mensual</h2>

      {entries.total <= 0 ? (
        <div className="mt-6 flex flex-col items-center gap-2 py-8 text-center">
          <span className="text-3xl" aria-hidden>
            📊
          </span>
          <p className="font-heading text-sm font-medium text-ink-500 dark:text-pink-200/60">
            Sin datos este mes todavia
          </p>
        </div>
      ) : (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-6">
          <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="flex-shrink-0">
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="currentColor"
              className="text-ink-900/5 dark:text-white/10"
              strokeWidth={STROKE}
            />
            <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
              {entries.items.map((item) => (
                <motion.circle
                  key={item.id}
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={RADIUS}
                  fill="none"
                  stroke={item.color}
                  strokeWidth={STROKE}
                  strokeLinecap="round"
                  pathLength={1}
                  initial={{ pathLength: 0, pathOffset: item.offset }}
                  animate={{ pathLength: item.fraction, pathOffset: item.offset }}
                  transition={{ type: 'spring', stiffness: 90, damping: 20 }}
                  style={{ strokeDasharray: 1 }}
                />
              ))}
            </g>
            <text
              x={SIZE / 2}
              y={SIZE / 2 - 6}
              textAnchor="middle"
              className="fill-ink-500 dark:fill-pink-200/60"
              style={{ fontFamily: 'var(--font-heading)', fontSize: 12, fontWeight: 600 }}
            >
              Este mes
            </text>
            <text
              x={SIZE / 2}
              y={SIZE / 2 + 16}
              textAnchor="middle"
              className="fill-ink-900 dark:fill-pink-50"
              style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 700 }}
            >
              {formatMoney(entries.total, currency)}
            </text>
          </svg>

          <ul className="flex min-w-[10rem] flex-1 flex-col gap-2">
            {entries.items.map((item) => (
              <li key={item.id} className="flex items-center gap-2 text-sm font-heading font-medium text-ink-700 dark:text-pink-100/80">
                <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ background: item.color }} />
                <span className="truncate">
                  {item.icon} {item.name}
                </span>
                <span className="ml-auto flex-shrink-0 text-pink-600 dark:text-pink-300">
                  {Math.round(item.fraction * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </GlassCard>
  )
}
