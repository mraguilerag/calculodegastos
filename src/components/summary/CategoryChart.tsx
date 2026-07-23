import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '../../store/useAppStore'
import { getTotalsByCategory, formatMoney } from '../../lib/dates'
import { filterExpensesByRange, getPeriodRange, getElapsedDays, previousPeriodLabel } from '../../lib/periods'
import { useCurrency } from '../../hooks/useCurrency'
import { useConvert } from '../../hooks/useConvert'
import type { PeriodNav } from '../../hooks/usePeriodNav'
import { GlassCard } from '../ui/GlassCard'
import { WeeklyBreakdown } from './WeeklyBreakdown'
import { UNCATEGORIZED_CATEGORY } from '../../data/defaultCategories'

const SIZE = 168
const STROKE = 24
const RADIUS = (SIZE - STROKE) / 2

interface CategoryChartProps {
  nav: PeriodNav
}

export function CategoryChart({ nav }: CategoryChartProps) {
  const expenses = useAppStore((s) => s.expenses)
  const categories = useAppStore((s) => s.categories)
  const currency = useCurrency()
  const convert = useConvert()
  const convertedExpenses = useMemo(
    () => expenses.map((e) => ({ ...e, amount: convert(e.amount, e.currency) })),
    [expenses, convert]
  )

  const periodExpenses = useMemo(
    () => filterExpensesByRange(convertedExpenses, nav.range),
    [convertedExpenses, nav.range]
  )

  const entries = useMemo(() => {
    const byCategory = getTotalsByCategory(periodExpenses)
    const total = Object.values(byCategory).reduce((a, b) => a + b, 0)
    if (total <= 0) return { total: 0, items: [] as Array<{ id: string; name: string; icon: string; color: string; amount: number; fraction: number; offset: number }> }

    let cumulative = 0
    const items = [...categories, UNCATEGORIZED_CATEGORY]
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
  }, [periodExpenses, categories])

  const previousTotal = useMemo(() => {
    const previousRange = getPeriodRange(nav.granularity, nav.offset - 1)
    const previousExpenses = filterExpensesByRange(convertedExpenses, previousRange)
    return previousExpenses.reduce((sum, e) => sum + e.amount, 0)
  }, [convertedExpenses, nav.granularity, nav.offset])

  const comparison = useMemo(() => {
    if (previousTotal <= 0) return null
    const delta = entries.total - previousTotal
    const pct = Math.round((delta / previousTotal) * 100)
    const label = previousPeriodLabel(nav.granularity)
    if (pct === 0) return { up: false, text: `Igual que ${label}` }
    return { up: delta > 0, text: `${delta > 0 ? '+' : ''}${pct}% vs. ${label}` }
  }, [entries.total, previousTotal, nav.granularity])

  const avgPerDay = useMemo(() => {
    if (entries.total <= 0) return 0
    const elapsedDays = getElapsedDays(nav.range)
    return entries.total / Math.max(1, elapsedDays)
  }, [entries.total, nav.range])

  const topCategory = entries.items[0]

  return (
    <GlassCard padding="lg" tilt={false}>
      <h2 className="font-heading text-xl font-semibold text-ink-900 dark:text-pink-50">{nav.label}</h2>

      {entries.total > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {topCategory && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/60 px-3 py-1 font-heading text-xs font-semibold text-ink-700 dark:bg-white/10 dark:text-pink-100/80">
              Más gasto en {topCategory.icon} {topCategory.name}
            </span>
          )}
          {comparison && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 font-heading text-xs font-semibold ${
                comparison.up
                  ? 'bg-rose-100/70 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300'
                  : 'bg-emerald-100/70 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-300'
              }`}
            >
              {comparison.up ? '▲' : '▼'} {comparison.text}
            </span>
          )}
        </div>
      )}

      {nav.granularity === 'week' && periodExpenses.length > 0 && (
        <WeeklyBreakdown expenses={periodExpenses} range={nav.range} currency={currency} />
      )}

      {entries.total <= 0 ? (
        <div className="mt-6 flex flex-col items-center gap-2 py-8 text-center">
          <span className="text-3xl" aria-hidden>
            📊
          </span>
          <p className="font-heading text-sm font-medium text-ink-500 dark:text-pink-200/60">
            Sin datos en este periodo
          </p>
        </div>
      ) : (
        <>
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
                Total
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

          <p className="mt-4 text-center font-heading text-xs font-medium text-ink-500 dark:text-pink-200/60">
            Promedio: {formatMoney(avgPerDay, currency)} por día
          </p>
        </>
      )}
    </GlassCard>
  )
}
