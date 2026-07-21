import { startOfWeek, startOfMonth, startOfYear, startOfDay, format } from 'date-fns'
import type { Expense, Totals } from '../types'

/** Convierte "yyyy-MM-dd" a Date local (evita corrimientos de zona horaria de parseISO/UTC). */
export function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function formatDisplayDate(iso: string): string {
  return format(parseLocalDate(iso), "d 'de' MMM, yyyy")
}

export function computeTotals(expenses: Expense[], referenceDate: Date = new Date()): Totals {
  const dayStart = startOfDay(referenceDate)
  const weekStart = startOfWeek(referenceDate, { weekStartsOn: 1 })
  const monthStart = startOfMonth(referenceDate)
  const yearStart = startOfYear(referenceDate)

  let today = 0
  let week = 0
  let month = 0
  let year = 0

  for (const expense of expenses) {
    const d = parseLocalDate(expense.date)
    if (d >= dayStart) today += expense.amount
    if (d >= weekStart) week += expense.amount
    if (d >= monthStart) month += expense.amount
    if (d >= yearStart) year += expense.amount
  }

  return { today, week, month, year }
}

export function getMonthExpenses(expenses: Expense[], referenceDate: Date = new Date()): Expense[] {
  const monthStart = startOfMonth(referenceDate)
  const nextMonthStart = startOfMonth(new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 1))
  return expenses.filter((e) => {
    const d = parseLocalDate(e.date)
    return d >= monthStart && d < nextMonthStart
  })
}

export function getTotalsByCategory(expenses: Expense[]): Record<string, number> {
  const map: Record<string, number> = {}
  for (const e of expenses) {
    map[e.categoryId] = (map[e.categoryId] ?? 0) + e.amount
  }
  return map
}

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)
}
