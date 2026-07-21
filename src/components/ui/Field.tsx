import type { ReactNode } from 'react'

export const inputClasses =
  'w-full rounded-2xl border-2 border-transparent bg-white/70 dark:bg-night-900/50 px-4 py-3 ' +
  'font-body text-ink-900 dark:text-pink-50 shadow-[inset_0_1px_2px_rgba(184,91,143,0.12)] ' +
  'placeholder:text-ink-300 dark:placeholder:text-pink-200/30 ' +
  'focus:outline-none focus:border-pink-400 focus:-translate-y-px transition-all duration-200'

interface FieldProps {
  label: string
  htmlFor: string
  children: ReactNode
  className?: string
}

export function Field({ label, htmlFor, children, className }: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block pl-1 font-heading text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-pink-200/60">
        {label}
      </label>
      {children}
    </div>
  )
}
