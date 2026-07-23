import { useState, type FormEvent } from 'react'
import { GlassCard } from '../ui/GlassCard'
import { Button } from '../ui/Button'
import { Field, inputClasses } from '../ui/Field'
import { CenteredScreen } from '../layout/CenteredScreen'

interface NamePromptProps {
  onSubmit: (name: string) => void
  onSkip: () => void
}

export function NamePrompt({ onSubmit, onSkip }: NamePromptProps) {
  const [name, setName] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onSubmit(trimmed)
  }

  return (
    <CenteredScreen>
      <GlassCard padding="lg" tilt={false} className="text-center">
        <span className="text-4xl" aria-hidden>
          🌸
        </span>
        <h2 className="mt-3 font-heading text-lg font-semibold text-ink-900 dark:text-pink-50">
          ¿Cómo te llamas?
        </h2>
        <p className="mt-2 text-sm text-ink-500 dark:text-pink-200/70">
          Así podemos saludarte cuando entres a Mis Gastos.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          <Field label="Nombre" htmlFor="display-name">
            <input
              id="display-name"
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClasses}
              placeholder="ej: María"
            />
          </Field>

          <div className="flex flex-col gap-3">
            <Button type="submit" disabled={!name.trim()} className="w-full">
              Continuar
            </Button>
            <Button type="button" variant="secondary" onClick={onSkip} className="w-full">
              Ahora no
            </Button>
          </div>
        </form>
      </GlassCard>
    </CenteredScreen>
  )
}
