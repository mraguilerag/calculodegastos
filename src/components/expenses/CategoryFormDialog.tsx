import { AnimatePresence, motion } from 'framer-motion'
import { createPortal } from 'react-dom'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Button } from '../ui/Button'
import { Field, inputClasses } from '../ui/Field'
import { CATEGORY_COLOR_PALETTE } from '../../data/defaultCategories'
import { suggestIcon, CATEGORY_ICON_OPTIONS } from '../../lib/categoryIcons'
import { cn } from '../../lib/cn'
import { sound } from '../../lib/sound'

interface CategoryFormDialogProps {
  open: boolean
  mode: 'create' | 'edit'
  initial?: { name: string; icon: string; color: string }
  onClose: () => void
  onSubmit: (input: { name: string; color: string; icon: string }) => void
}

export function CategoryFormDialog({ open, mode, initial, onClose, onSubmit }: CategoryFormDialogProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(CATEGORY_COLOR_PALETTE[0])
  const [icon, setIcon] = useState<string | null>(null)
  const [iconTouched, setIconTouched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    setName(initial?.name ?? '')
    setColor(initial?.color ?? CATEGORY_COLOR_PALETTE[0])
    setIcon(initial?.icon ?? null)
    // en modo edicion el icono ya fue elegido antes; no lo pisamos si retocan el nombre
    setIconTouched(mode === 'edit')
    setTimeout(() => inputRef.current?.focus(), 60)
  }, [open, initial, mode])

  function handleNameChange(value: string) {
    setName(value)
    if (!iconTouched) {
      setIcon(suggestIcon(value))
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim() || !icon) {
      sound.error()
      return
    }
    onSubmit({ name: name.trim(), color, icon })
  }

  const title = mode === 'edit' ? 'Editar categoria' : 'Nueva categoria'
  const submitLabel = mode === 'edit' ? 'Guardar cambios' : 'Crear categoria'

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-ink-900/35 dark:bg-black/55 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.form
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 8 }}
            transition={{ type: 'spring', stiffness: 340, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="w-full max-w-sm rounded-3xl border border-white/70 dark:border-white/10 bg-white/90 dark:bg-night-800/90 backdrop-blur-xl p-6 shadow-[var(--shadow-glass-lg)]"
          >
            <h2 className="font-heading text-lg font-semibold text-ink-900 dark:text-pink-50">{title}</h2>

            <Field label="Nombre" htmlFor="cat-name" className="mt-4">
              <input
                ref={inputRef}
                id="cat-name"
                type="text"
                maxLength={24}
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="ej: Mascota"
                className={inputClasses}
              />
            </Field>

            <div className="mt-4">
              <span className="mb-1.5 block pl-1 font-heading text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-pink-200/60">
                Icono
              </span>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_ICON_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setIcon(opt)
                      setIconTouched(true)
                    }}
                    aria-label={`Icono ${opt}`}
                    aria-pressed={icon === opt}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-full border-2 text-lg transition-transform',
                      icon === opt
                        ? 'scale-110 border-ink-900 bg-white dark:border-white dark:bg-night-700'
                        : 'border-transparent bg-white/60 hover:scale-105 dark:bg-night-700/50'
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <span className="mb-1.5 block pl-1 font-heading text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-pink-200/60">
                Color
              </span>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_COLOR_PALETTE.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    aria-label={`Color ${c}`}
                    className={cn(
                      'h-7 w-7 rounded-full border-2 transition-transform',
                      color === c ? 'scale-110 border-ink-900 dark:border-white' : 'border-transparent hover:scale-105'
                    )}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!name.trim() || !icon}>
                {submitLabel}
              </Button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
