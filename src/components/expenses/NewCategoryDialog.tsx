import { AnimatePresence, motion } from 'framer-motion'
import { createPortal } from 'react-dom'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Button } from '../ui/Button'
import { Field, inputClasses } from '../ui/Field'
import { CATEGORY_COLOR_PALETTE } from '../../data/defaultCategories'
import { cn } from '../../lib/cn'
import { sound } from '../../lib/sound'

interface NewCategoryDialogProps {
  open: boolean
  onClose: () => void
  onCreate: (input: { name: string; color: string; icon: string }) => void
}

export function NewCategoryDialog({ open, onClose, onCreate }: NewCategoryDialogProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(CATEGORY_COLOR_PALETTE[0])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setName('')
      setColor(CATEGORY_COLOR_PALETTE[0])
      setTimeout(() => inputRef.current?.focus(), 60)
    }
  }, [open])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      sound.error()
      return
    }
    onCreate({ name: name.trim(), color, icon: '🐾' })
  }

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
            aria-label="Nueva categoria"
            className="w-full max-w-sm rounded-3xl border border-white/70 dark:border-white/10 bg-white/90 dark:bg-night-800/90 backdrop-blur-xl p-6 shadow-[var(--shadow-glass-lg)]"
          >
            <h2 className="font-heading text-lg font-semibold text-ink-900 dark:text-pink-50">Nueva categoria</h2>

            <Field label="Nombre" htmlFor="new-cat-name" className="mt-4">
              <input
                ref={inputRef}
                id="new-cat-name"
                type="text"
                maxLength={24}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ej: Mascota"
                className={inputClasses}
              />
            </Field>

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
              <Button type="submit">Crear categoria</Button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
