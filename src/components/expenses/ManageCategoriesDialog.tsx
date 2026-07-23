import { AnimatePresence, motion } from 'framer-motion'
import { createPortal } from 'react-dom'
import { useState } from 'react'
import { Button } from '../ui/Button'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { CategoryFormDialog } from './CategoryFormDialog'
import { useAppStore } from '../../store/useAppStore'
import { useToast } from '../ui/ToastProvider'
import { sound } from '../../lib/sound'

interface ManageCategoriesDialogProps {
  open: boolean
  onClose: () => void
}

export function ManageCategoriesDialog({ open, onClose }: ManageCategoriesDialogProps) {
  const categories = useAppStore((s) => s.categories)
  const updateCategory = useAppStore((s) => s.updateCategory)
  const deleteCategory = useAppStore((s) => s.deleteCategory)
  const { showToast } = useToast()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const editingCategory = categories.find((c) => c.id === editingId) ?? null
  const deletingCategory = categories.find((c) => c.id === deletingId) ?? null
  const onlyOneLeft = categories.length <= 1

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
      setDeletingId(null)
      sound.delete()
      showToast('Categoria eliminada', { icon: '🗑' })
    } catch (err) {
      sound.error()
      showToast(err instanceof Error ? err.message : 'No se pudo eliminar la categoria.', { variant: 'error' })
    }
  }

  return (
    <>
      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] flex items-center justify-center bg-ink-900/35 dark:bg-black/55 backdrop-blur-sm p-4"
              onClick={onClose}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 8 }}
                transition={{ type: 'spring', stiffness: 340, damping: 26 }}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label="Gestionar categorias"
                className="w-full max-w-sm rounded-3xl border border-white/70 dark:border-white/10 bg-white/90 dark:bg-night-800/90 backdrop-blur-xl p-6 shadow-[var(--shadow-glass-lg)]"
              >
                <h2 className="font-heading text-lg font-semibold text-ink-900 dark:text-pink-50">
                  Gestionar categorias
                </h2>

                <ul className="mt-4 flex max-h-[22rem] flex-col gap-1.5 overflow-y-auto pr-1">
                  {categories.map((cat) => (
                    <li
                      key={cat.id}
                      className="flex items-center gap-2.5 rounded-2xl border border-white/60 dark:border-white/10 bg-white/55 dark:bg-night-800/45 px-3 py-2.5"
                    >
                      <span
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-base"
                        style={{ backgroundColor: `${cat.color}40` }}
                        aria-hidden
                      >
                        {cat.icon}
                      </span>
                      <span className="min-w-0 flex-1 truncate font-heading text-sm font-medium text-ink-900 dark:text-pink-50">
                        {cat.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingId(cat.id)}
                        aria-label={`Editar ${cat.name}`}
                        title="Editar"
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-ink-500 dark:text-pink-200/60 transition-colors hover:bg-pink-100 hover:text-pink-700 dark:hover:bg-white/10 dark:hover:text-pink-200"
                      >
                        ✎
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingId(cat.id)}
                        disabled={onlyOneLeft}
                        aria-label={`Eliminar ${cat.name}`}
                        title={onlyOneLeft ? 'No puedes eliminar tu unica categoria' : 'Eliminar'}
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-ink-500 dark:text-pink-200/60 transition-colors hover:bg-rose-100 hover:text-rose-600 disabled:opacity-30 disabled:pointer-events-none dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 flex justify-end">
                  <Button type="button" variant="ghost" onClick={onClose}>
                    Cerrar
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

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
    </>
  )
}
