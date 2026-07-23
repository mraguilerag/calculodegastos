import { motion } from 'framer-motion'
import { useRef, useState, type CSSProperties } from 'react'
import type { Category } from '../../types'
import { cn } from '../../lib/cn'
import { sound } from '../../lib/sound'
import { useAppStore } from '../../store/useAppStore'
import { useToast } from '../ui/ToastProvider'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { CategoryFormDialog } from './CategoryFormDialog'

const LONG_PRESS_MS = 450

interface CategoryPickerProps {
  categories: Category[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  onRequestNew: () => void
}

interface CategoryChipProps {
  cat: Category
  active: boolean
  canDelete: boolean
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
}

function CategoryChip({ cat, active, canDelete, onSelect, onEdit, onDelete }: CategoryChipProps) {
  const [revealed, setRevealed] = useState(false)
  const longPressTimer = useRef<number | null>(null)
  const longPressTriggered = useRef(false)

  function startLongPress() {
    longPressTriggered.current = false
    longPressTimer.current = window.setTimeout(() => {
      longPressTriggered.current = true
      setRevealed(true)
    }, LONG_PRESS_MS)
  }

  function cancelLongPress() {
    if (longPressTimer.current !== null) {
      window.clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  return (
    <div
      className="group relative"
      onMouseEnter={() => setRevealed(true)}
      onMouseLeave={() => setRevealed(false)}
    >
      <motion.button
        type="button"
        role="radio"
        aria-checked={active}
        whileTap={{ scale: 0.94 }}
        onTouchStart={startLongPress}
        onTouchEnd={cancelLongPress}
        onTouchMove={cancelLongPress}
        onClick={() => {
          if (longPressTriggered.current) {
            longPressTriggered.current = false
            return
          }
          sound.click()
          onSelect()
        }}
        style={
          active
            ? ({
                borderColor: cat.color,
                backgroundColor: `${cat.color}2e`,
                boxShadow: `0 0 0 3px ${cat.color}40`,
              } satisfies CSSProperties)
            : undefined
        }
        className={cn(
          'inline-flex items-center gap-1 rounded-full border-2 px-2.5 py-1.5 text-xs font-heading font-medium',
          'transition-all duration-200',
          active
            ? 'text-ink-900 dark:text-pink-50'
            : 'border-transparent bg-white/60 dark:bg-night-700/50 text-ink-700 dark:text-pink-100/80 hover:-translate-y-0.5'
        )}
      >
        <span className="h-2 w-2 rounded-full" style={{ background: cat.color }} aria-hidden />
        <span>{cat.icon}</span>
        <span>{cat.name}</span>
      </motion.button>

      <div
        className={cn(
          'absolute -top-1.5 -right-1.5 flex gap-0.5 opacity-0 transition-opacity duration-150',
          'group-hover:opacity-100 group-focus-within:opacity-100',
          revealed && 'opacity-100'
        )}
      >
        <button
          type="button"
          onClick={() => {
            sound.click()
            setRevealed(false)
            onEdit()
          }}
          aria-label={`Editar ${cat.name}`}
          title="Editar"
          className="flex h-5 w-5 items-center justify-center rounded-full border border-white/70 bg-white text-[10px] text-ink-600 shadow-sm transition-colors hover:bg-pink-100 hover:text-pink-700 dark:border-white/10 dark:bg-night-700 dark:text-pink-200 dark:hover:bg-white/10"
        >
          ✎
        </button>
        <button
          type="button"
          onClick={() => {
            if (!canDelete) return
            sound.click()
            setRevealed(false)
            onDelete()
          }}
          disabled={!canDelete}
          aria-label={`Eliminar ${cat.name}`}
          title={canDelete ? 'Eliminar' : 'No puedes eliminar tu unica categoria'}
          className="flex h-5 w-5 items-center justify-center rounded-full border border-white/70 bg-white text-[10px] text-ink-600 shadow-sm transition-colors hover:bg-rose-100 hover:text-rose-600 disabled:opacity-40 disabled:pointer-events-none dark:border-white/10 dark:bg-night-700 dark:text-pink-200 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

export function CategoryPicker({ categories, selectedId, onSelect, onRequestNew }: CategoryPickerProps) {
  const updateCategory = useAppStore((s) => s.updateCategory)
  const deleteCategory = useAppStore((s) => s.deleteCategory)
  const { showToast } = useToast()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const editingCategory = categories.find((c) => c.id === editingId) ?? null
  const deletingCategory = categories.find((c) => c.id === deletingId) ?? null
  const canDelete = categories.length > 1

  async function handleUpdate(input: { name: string; color: string; icon: string }) {
    if (!editingId) return
    try {
      await updateCategory(editingId, input)
      setEditingId(null)
      sound.save()
      showToast('Categoria actualizada', { icon: '✓' })
    } catch (err) {
      sound.error()
      showToast(err instanceof Error ? err.message : 'No se pudo actualizar la categoria.', { variant: 'error' })
    }
  }

  async function handleConfirmDelete() {
    if (!deletingCategory) return
    try {
      await deleteCategory(deletingCategory.id)
      if (selectedId === deletingCategory.id) onSelect(null)
      setDeletingId(null)
      sound.delete()
      showToast('Categoria eliminada', { icon: '🗑' })
    } catch (err) {
      sound.error()
      showToast(err instanceof Error ? err.message : 'No se pudo eliminar la categoria.', { variant: 'error' })
    }
  }

  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Categoria">
      <motion.button
        type="button"
        role="radio"
        aria-checked={selectedId === null}
        whileTap={{ scale: 0.94 }}
        onClick={() => {
          sound.click()
          onSelect(null)
        }}
        className={cn(
          'inline-flex items-center gap-1 rounded-full border-2 px-2.5 py-1.5 text-xs font-heading font-medium',
          'transition-all duration-200',
          selectedId === null
            ? 'border-ink-400 bg-ink-100/70 text-ink-900 dark:border-pink-200/40 dark:bg-white/10 dark:text-pink-50'
            : 'border-transparent bg-white/60 dark:bg-night-700/50 text-ink-700 dark:text-pink-100/80 hover:-translate-y-0.5'
        )}
      >
        <span aria-hidden>🚫</span>
        <span>Sin categoria</span>
      </motion.button>

      {categories.map((cat) => (
        <CategoryChip
          key={cat.id}
          cat={cat}
          active={cat.id === selectedId}
          canDelete={canDelete}
          onSelect={() => onSelect(cat.id)}
          onEdit={() => setEditingId(cat.id)}
          onDelete={() => setDeletingId(cat.id)}
        />
      ))}

      <motion.button
        type="button"
        whileTap={{ scale: 0.94 }}
        onClick={() => {
          sound.click()
          onRequestNew()
        }}
        className="inline-flex items-center gap-1 rounded-full border border-dashed border-ink-300/60 dark:border-pink-200/30 px-2 py-1 text-xs font-heading font-medium text-ink-400 dark:text-pink-200/50 hover:-translate-y-0.5 transition-all duration-200"
      >
        <span aria-hidden>+</span>
        <span>Nueva categoria</span>
      </motion.button>

      <CategoryFormDialog
        open={Boolean(editingCategory)}
        mode="edit"
        initial={editingCategory ?? undefined}
        onClose={() => setEditingId(null)}
        onSubmit={handleUpdate}
      />

      <ConfirmDialog
        open={Boolean(deletingCategory)}
        title="Eliminar categoria"
        description={
          deletingCategory
            ? `Se eliminara "${deletingCategory.name}". Los gastos que tenga se reasignaran a otra categoria.`
            : undefined
        }
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  )
}
