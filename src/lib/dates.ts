import { startOfWeek, startOfMonth, startOfYear, startOfDay, format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Expense, Totals } from '../types'
import type { Currency } from '../data/currencies'

/** Convierte "yyyy-MM-dd" a Date local (evita corrimientos de zona horaria de parseISO/UTC). */
export function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function formatDisplayDate(iso: string): string {
  return format(parseLocalDate(iso), "d 'de' MMM, yyyy", { locale: es })
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

/** Etiqueta legible para agrupar el historial: "Hoy", "Ayer" o la fecha formateada. */
export function formatGroupLabel(iso: string): string {
  if (iso === todayISO()) return 'Hoy'
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  if (iso === format(yesterday, 'yyyy-MM-dd')) return 'Ayer'
  const text = format(parseLocalDate(iso), "EEEE d 'de' MMMM", { locale: es })
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function getTotalsByCategory(expenses: Expense[]): Record<string, number> {
  const map: Record<string, number> = {}
  for (const e of expenses) {
    map[e.categoryId] = (map[e.categoryId] ?? 0) + e.amount
  }
  return map
}

/** Formatea un monto con el simbolo y las reglas (decimales, separadores) de la moneda dada. */
export function formatMoney(amount: number, currency: Currency): string {
  const number = new Intl.NumberFormat(currency.locale, {
    minimumFractionDigits: currency.decimals,
    maximumFractionDigits: currency.decimals,
  }).format(amount)
  return `${currency.symbol}${number}`
}
