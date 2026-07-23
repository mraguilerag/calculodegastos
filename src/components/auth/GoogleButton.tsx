import { motion } from 'framer-motion'

interface GoogleButtonProps {
  onClick: () => void
  disabled?: boolean
}

function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.81.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.95v2.33A9 9 0 0 0 9 18z"
      />
      <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.17.29-1.7V4.96H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.04l3-2.33z" />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .95 4.96l3 2.33C4.66 5.17 6.65 3.58 9 3.58z"
      />
    </svg>
  )
}

export function GoogleButton({ onClick, disabled }: GoogleButtonProps) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.96 }}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex w-full items-center justify-center gap-2.5 rounded-full border border-white/70 bg-white/85 px-5 py-2.5 font-heading text-sm font-semibold text-ink-700 shadow-[var(--shadow-glass-sm)] transition-colors disabled:opacity-50 dark:border-white/10 dark:bg-night-700/70 dark:text-pink-100"
    >
      <GoogleGlyph />
      Continuar con Google
    </motion.button>
  )
}
