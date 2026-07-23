import { AnimatePresence, motion } from 'framer-motion'
import { createPortal } from 'react-dom'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Button } from '../ui/Button'
import { Field, inputClasses } from '../ui/Field'

interface EditNameDialogProps {
  open: boolean
  currentName: string
  onClose: () => void
  onSave: (name: string) => void
}

export function EditNameDialog({ open, currentName, onClose, onSave }: EditNameDialogProps) {
  const [name, setName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setName(currentName)
      setTimeout(() => inputRef.current?.focus(), 60)
    }
  }, [open, currentName])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSave(name.trim())
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
            aria-label="Editar nombre"
            className="w-full max-w-sm rounded-3xl border border-white/70 dark:border-white/10 bg-white/90 dark:bg-night-800/90 backdrop-blur-xl p-6 shadow-[var(--shadow-glass-lg)]"
          >
            <h2 className="font-heading text-lg font-semibold text-ink-900 dark:text-pink-50">Tu nombre</h2>
            <p className="mt-1 text-sm text-ink-500 dark:text-pink-200/60">Así te saludamos en la app.</p>

            <Field label="Nombre" htmlFor="edit-name-input" className="mt-4">
              <input
                ref={inputRef}
                id="edit-name-input"
                type="text"
                maxLength={40}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ej: María"
                className={inputClasses}
              />
            </Field>

            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">Guardar</Button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
