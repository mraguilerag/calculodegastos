import {
  startOfWeek,
  startOfMonth,
  startOfYear,
  addWeeks,
  addMonths,
  addYears,
  subDays,
  format,
  isSameMonth,
  isSameYear,
  differenceInCalendarDays,
} from 'date-fns'
import { es } from 'date-fns/locale'
import type { Expense } from '../types'
import { parseLocalDate } from './dates'

export type Granularity = 'week' | 'month' | 'year'

export interface PeriodRange {
  /** Inclusive */
  start: Date
  /** Exclusive */
  end: Date
}

export function getPeriodRange(granularity: Granularity, offset: number, today: Date = new Date()): PeriodRange {
  if (granularity === 'week') {
    const start = addWeeks(startOfWeek(today, { weekStartsOn: 1 }), offset)
    return { start, end: addWeeks(start, 1) }
  }
  if (granularity === 'month') {
    const start = addMonths(startOfMonth(today), offset)
    return { start, end: addMonths(start, 1) }
  }
  const start = addYears(startOfYear(today), offset)
  return { start, end: addYears(start, 1) }
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function formatPeriodLabel(granularity: Granularity, range: PeriodRange): string {
  const lastDay = subDays(range.end, 1)

  if (granularity === 'month') {
    return capitalize(format(range.start, 'MMMM yyyy', { locale: es }))
  }

  if (granularity === 'year') {
    return format(range.start, 'yyyy', { locale: es })
  }

  // week
  if (isSameMonth(range.start, lastDay) && isSameYear(range.start, lastDay)) {
    return `Semana del ${format(range.start, 'd', { locale: es })} al ${format(lastDay, "d 'de' MMMM", { locale: es })}`
  }
  if (isSameYear(range.start, lastDay)) {
    return `Semana del ${format(range.start, "d 'de' MMM", { locale: es })} al ${format(lastDay, "d 'de' MMM", { locale: es })}`
  }
  return `Semana del ${format(range.start, "d 'de' MMM yyyy", { locale: es })} al ${format(lastDay, "d 'de' MMM yyyy", { locale: es })}`
}

export function filterExpensesByRange(expenses: Expense[], range: PeriodRange): Expense[] {
  return expenses.filter((e) => {
    const d = parseLocalDate(e.date)
    return d >= range.start && d < range.end
  })
}

export function isCurrentPeriod(offset: number): boolean {
  return offset === 0
}

const GRANULARITY_PREVIOUS_LABEL: Record<Granularity, string> = {
  week: 'semana anterior',
  month: 'mes anterior',
  year: 'año anterior',
}

export function previousPeriodLabel(granularity: Granularity): string {
  return GRANULARITY_PREVIOUS_LABEL[granularity]
}

/** Dias transcurridos dentro del rango, hasta hoy si el rango sigue en curso. */
export function getElapsedDays(range: PeriodRange, today: Date = new Date()): number {
  const totalDays = differenceInCalendarDays(range.end, range.start)
  if (today < range.start) return 0
  if (today >= range.end) return totalDays
  return differenceInCalendarDays(today, range.start) + 1
}

export function daysInRange(range: PeriodRange): number {
  return differenceInCalendarDays(range.end, range.start)
}
