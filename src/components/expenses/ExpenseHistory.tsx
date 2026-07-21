import { useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useAppStore } from '../../store/useAppStore'
import type { Expense } from '../../types'
import { GlassCard } from '../ui/GlassCard'
import { ExpenseListItem } from './ExpenseListItem'
import { EditExpenseDialog } from './EditExpenseDialog'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { useToast } from '../ui/ToastProvider'
import { sound } from '../../lib/sound'
import { formatMoney } from '../../lib/dates'
import { useCurrency } from '../../hooks/useCurrency'

export function ExpenseHistory() {
  const expenses = useAppStore((s) => s.expenses)
  const categories = useAppStore((s) => s.categories)
  const updateExpense = useAppStore((s) => s.updateExpense)
  const deleteExpense = useAppStore((s) => s.deleteExpense)
  const { showToast } = useToast()
  const currency = useCurrency()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const sorted = useMemo(
    () =>
      [...expenses].sort((a, b) => {
        if (a.date !== b.date) return a.date < b.date ? 1 : -1
        return b.createdAt - a.createdAt
      }),
    [expenses]
  )

  const categoryMap = useMemo(() => {
    const map = new Map(categories.map((c) => [c.id, c]))
    return map
  }, [categories])

  const editingExpense: Expense | null = sorted.find((e) => e.id === editingId) ?? null
  const deletingExpense: Expense | null = sorted.find((e) => e.id === deletingId) ?? null
  const fallbackCategory = categoryMap.get('otros') ?? categories[0]

  function handleSave(id: string, patch: { amount: string; categoryId: string; description: string; date: string }) {
    try {
      updateExpense(id, patch)
      setEditingId(null)
      sound.check()
      showToast('Gasto actualizado', { icon: '✓' })
    } catch (err) {
      sound.error()
      showToast(err instanceof Error ? err.message : 'No se pudo actualizar el gasto.', { variant: 'error' })
    }
  }

  function handleConfirmDelete() {
    if (!deletingExpense) return
    deleteExpense(deletingExpense.id)
    setDeletingId(null)
    sound.delete()
    showToast('Gasto eliminado', { icon: '🗑' })
  }

  return (
    <GlassCard padding="lg" tilt={false}>
      <h2 className="font-heading text-xl font-semibold text-ink-900 dark:text-pink-50">Historial</h2>

      {sorted.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-2 py-6 text-center">
          <span className="text-3xl" aria-hidden>
            🧾
          </span>
          <p className="font-heading text-sm font-medium text-ink-500 dark:text-pink-200/60">
            Todavia no hay gastos registrados
          </p>
          <p className="text-xs text-ink-300 dark:text-pink-200/40">Anota el primero desde el formulario</p>
        </div>
      ) : (
        <ul className="mt-4 flex max-h-[28rem] flex-col gap-2 overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {sorted.map((expense) => (
              <ExpenseListItem
                key={expense.id}
                expense={expense}
                category={categoryMap.get(expense.categoryId) ?? fallbackCategory}
                onEdit={() => setEditingId(expense.id)}
                onDelete={() => setDeletingId(expense.id)}
              />
            ))}
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
