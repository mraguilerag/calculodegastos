import { useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useAppStore } from '../../store/useAppStore'
import type { Expense } from '../../types'
import type { PeriodNav } from '../../hooks/usePeriodNav'
import { filterExpensesByRange } from '../../lib/periods'
import { GlassCard } from '../ui/GlassCard'
import { ExpenseListItem } from './ExpenseListItem'
import { EditExpenseDialog } from './EditExpenseDialog'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { useToast } from '../ui/ToastProvider'
import { sound } from '../../lib/sound'
import { formatMoney, formatGroupLabel } from '../../lib/dates'
import { useCurrency } from '../../hooks/useCurrency'
import { UNCATEGORIZED_CATEGORY } from '../../data/defaultCategories'

interface ExpenseHistoryProps {
  nav: PeriodNav
}

export function ExpenseHistory({ nav }: ExpenseHistoryProps) {
  const expenses = useAppStore((s) => s.expenses)
  const categories = useAppStore((s) => s.categories)
  const updateExpense = useAppStore((s) => s.updateExpense)
  const deleteExpense = useAppStore((s) => s.deleteExpense)
  const { showToast } = useToast()
  const currency = useCurrency()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)

  const scoped = showAll ? expenses : filterExpensesByRange(expenses, nav.range)

  const sorted = useMemo(
    () =>
      [...scoped].sort((a, b) => {
        if (a.date !== b.date) return a.date < b.date ? 1 : -1
        return b.createdAt - a.createdAt
      }),
    [scoped]
  )

  const categoryMap = useMemo(() => {
    const map = new Map(categories.map((c) => [c.id, c]))
    return map
  }, [categories])

  const groups = useMemo(() => {
    const list: Array<{ dateIso: string; label: string; items: Expense[] }> = []
    for (const expense of sorted) {
      const last = list[list.length - 1]
      if (last && last.dateIso === expense.date) {
        last.items.push(expense)
      } else {
        list.push({ dateIso: expense.date, label: formatGroupLabel(expense.date), items: [expense] })
      }
    }
    return list
  }, [sorted])

  const editingExpense: Expense | null = sorted.find((e) => e.id === editingId) ?? null
  const deletingExpense: Expense | null = sorted.find((e) => e.id === deletingId) ?? null
  const fallbackCategory = categoryMap.get('otros') ?? categories[0]

  async function handleSave(
    id: string,
    patch: { amount: number; categoryId: string | null; description: string; date: string }
  ) {
    try {
      await updateExpense(id, patch)
      setEditingId(null)
      sound.check()
      showToast('Gasto actualizado', { icon: '✓' })
    } catch (err) {
      sound.error()
      showToast(err instanceof Error ? err.message : 'No se pudo actualizar el gasto.', { variant: 'error' })
    }
  }

  async function handleConfirmDelete() {
    if (!deletingExpense) return
    try {
      await deleteExpense(deletingExpense.id)
      setDeletingId(null)
      sound.delete()
      showToast('Gasto eliminado', { icon: '🗑' })
    } catch (err) {
      sound.error()
      showToast(err instanceof Error ? err.message : 'No se pudo eliminar el gasto.', { variant: 'error' })
    }
  }

  return (
    <GlassCard padding="lg" tilt={false}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-heading text-xl font-semibold text-ink-900 dark:text-pink-50">Historial</h2>
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="font-heading text-xs font-semibold text-pink-600 underline underline-offset-2 dark:text-pink-300"
        >
          {showAll ? 'Ver solo este periodo' : 'Ver historial completo'}
        </button>
      </div>
      <p className="mt-1 text-xs text-ink-500 dark:text-pink-200/60">
        {showAll ? 'Todos los gastos registrados' : nav.label}
      </p>

      {sorted.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-2 py-6 text-center">
          <span className="text-3xl" aria-hidden>
            🧾
          </span>
          <p className="font-heading text-sm font-medium text-ink-500 dark:text-pink-200/60">
            {showAll ? 'Todavia no hay gastos registrados' : 'No hay gastos en este periodo'}
          </p>
          <p className="text-xs text-ink-300 dark:text-pink-200/40">
            {showAll ? 'Anota el primero desde el formulario' : 'Prueba con otro periodo o revisa el historial completo'}
          </p>
        </div>
      ) : (
        <ul className="mt-4 flex max-h-[28rem] flex-col gap-2 overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {groups.flatMap((group) => [
              <li
                key={`heading-${group.dateIso}`}
                className="px-1 pt-2 font-heading text-xs font-semibold uppercase tracking-wide text-ink-400 first:pt-0 dark:text-pink-200/40"
              >
                {group.label}
              </li>,
              ...group.items.map((expense) => (
                <ExpenseListItem
                  key={expense.id}
                  expense={expense}
                  category={
                    expense.categoryId === null
                      ? UNCATEGORIZED_CATEGORY
                      : categoryMap.get(expense.categoryId) ?? fallbackCategory
                  }
                  onEdit={() => setEditingId(expense.id)}
                  onDelete={() => setDeletingId(expense.id)}
                />
              )),
            ])}
          </AnimatePresence>
        </ul>
      )}

      <EditExpenseDialog
        expense={editingExpense}
        categories={categories}
        onClose={() => setEditingId(null)}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={Boolean(deletingExpense)}
        title="Eliminar gasto"
        description={
          deletingExpense
            ? `Se eliminara "${deletingExpense.description || 'este gasto'}" de ${formatMoney(deletingExpense.amount, currency)}.`
            : undefined
        }
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </GlassCard>
  )
}
