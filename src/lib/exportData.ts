import type { Category, Expense } from '../types'
import { formatDisplayDate } from './dates'

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

/**
 * Exporta todos los gastos a un CSV y dispara la descarga en el navegador.
 * Usa el monto y la moneda originales de cada gasto (no convertidos a la
 * moneda de visualizacion activa), para que el registro exportado sea exacto.
 */
export function exportExpensesToCsv(expenses: Expense[], categories: Category[]): void {
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]))
  const rows = [['Fecha', 'Categoria', 'Descripcion', 'Monto', 'Moneda']]

  const sorted = [...expenses].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
  for (const e of sorted) {
    rows.push([
      formatDisplayDate(e.date),
      e.categoryId === null ? 'Sin categoría' : categoryMap.get(e.categoryId) ?? e.categoryId,
      e.description,
      e.amount.toFixed(2),
      e.currency,
    ])
  }

  const csv = rows.map((row) => row.map((cell) => csvEscape(String(cell))).join(',')).join('\n')
  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  const today = new Date().toISOString().slice(0, 10)
  link.download = `mis-gastos-${today}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
