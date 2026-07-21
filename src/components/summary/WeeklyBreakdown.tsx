import { useMemo } from 'react'
import { addDays, format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Expense } from '../../types'
import type { PeriodRange } from '../../lib/periods'
import type { Currency } from '../../data/currencies'
import { formatMoney } from '../../lib/dates'

interface WeeklyBreakdownProps {
  expenses: Expense[]
  range: PeriodRange
  currency: Currency
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function WeeklyBreakdown({ expenses, range, currency }: WeeklyBreakdownProps) {
  const days = useMemo(() => {
    const list = Array.from({ length: 7 }, (_, i) => {
      const date = addDays(range.start, i)
      return { date, iso: format(date, 'yyyy-MM-dd'), total: 0 }
    })
    const byIso = new Map(list.map((d) => [d.iso, d]))
    for (const e of expenses) {
      const day = byIso.get(e.date)
      if (day) day.total += e.amount
    }
    return list
  }, [expenses, range])

  const max = Math.max(...days.map((d) => d.total), 0.01)

  return (
    <div className="mb-6 flex flex-col gap-2">
      {days.map((day) => (
        <div key={day.iso} className="flex items-center gap-3">
          <span className="w-24 flex-shrink-0 font-heading text-xs font-semibold text-ink-700 dark:text-pink-100/80">
            {capitalize(format(day.date, 'EEE d', { locale: es }))}
          </span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/50 dark:bg-night-900/50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-pink-300 to-gold-400"
              style={{ width: `${(day.total / max) * 100}%` }}
            />
          </div>
          <span className="w-20 flex-shrink-0 text-right font-heading text-xs font-semibold text-pink-600 dark:text-pink-300">
            {day.total > 0 ? formatMoney(day.total, currency) : '—'}
          </span>
        </div>
      ))}
    </div>
  )
}
