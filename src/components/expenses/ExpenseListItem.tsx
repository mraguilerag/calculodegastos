import { motion } from 'framer-motion'
import type { Category, Expense } from '../../types'
import { formatDisplayDate, formatMoney } from '../../lib/dates'

interface ExpenseListItemProps {
  expense: Expense
  category: Category
  onEdit: () => void
  onDelete: () => void
}

export function ExpenseListItem({ expense, category, onEdit, onDelete }: ExpenseListItemProps) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -24, scale: 0.96, transition: { duration: 0.18 } }}
      transition={{ type: 'spring', stiffness: 340, damping: 28 }}
      className="flex items-center gap-3 rounded-2xl border border-white/60 dark:border-white/10 bg-white/55 dark:bg-night-800/45 px-3.5 py-3 shadow-[var(--shadow-glass-sm)]"
    >
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg"
        style={{ backgroundColor: `${category.color}40` }}
        aria-hidden
      >
        {category.icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-heading text-sm font-semibold text-ink-900 dark:text-pink-50">
          {expense.description || category.name}
        </p>
        <p className="text-xs text-ink-500 dark:text-pink-200/60">
          {category.name} &middot; {formatDisplayDate(expense.date)}
        </p>
      </div>

      <span className="whitespace-nowrap font-heading text-sm font-semibold text-pink-600 dark:text-pink-300">
        ${formatMoney(expense.amount)}
      </span>

      <div className="flex flex-shrink-0 gap-1">
        <button
          type="button"
          onClick={onEdit}
          aria-label="Editar gasto"
          title="Editar"
          className="flex h-8 w-8 items-center justify-center rounded-full text-ink-500 dark:text-pink-200/60 transition-colors hover:bg-pink-100 hover:text-pink-700 dark:hover:bg-white/10 dark:hover:text-pink-200"
        >
          ✎
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label="Eliminar gasto"
          title="Eliminar"
          className="flex h-8 w-8 items-center justify-center rounded-full text-ink-500 dark:text-pink-200/60 transition-colors hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
        >
          ✕
        </button>
      </div>
    </motion.li>
  )
}
