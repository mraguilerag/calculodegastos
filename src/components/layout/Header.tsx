import { lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '../../store/useAppStore'
import { GlassCard } from '../ui/GlassCard'
import { sound, primeAudio } from '../../lib/sound'
import { bgm } from '../../lib/bgm'
import { CurrencyPicker } from './CurrencyPicker'

const HeartScene = lazy(() => import('../heart/HeartScene').then((m) => ({ default: m.HeartScene })))

export function Header() {
  const theme = useAppStore((s) => s.settings.theme)
  const soundEnabled = useAppStore((s) => s.settings.soundEnabled)
  const toggleTheme = useAppStore((s) => s.toggleTheme)
  const toggleSound = useAppStore((s) => s.toggleSound)

  return (
    <GlassCard padding="sm" tilt={false} className="flex flex-wrap items-center justify-between gap-4">
      <Suspense
        fallback={
          <div className="flex h-28 w-28 flex-shrink-0 items-center justify-center text-5xl sm:h-32 sm:w-32">
            💗
          </div>
        }
      >
        <HeartScene />
      </Suspense>

      <div className="w-full flex-1 text-center sm:w-auto">
        <h1 className="font-display text-4xl uppercase leading-none tracking-wide text-pink-600 dark:text-pink-300 sm:text-5xl">
          Mis Gastos
        </h1>
        <p className="mt-2 font-hand -rotate-1 text-base text-pink-400/70 dark:text-pink-300/50 sm:text-lg">
          by María
        </p>
        <p className="mt-1 font-heading text-xs text-ink-500 dark:text-pink-200/60 sm:text-sm">
          Control de gastos personales
        </p>
      </div>

      <div className="flex items-center gap-2">
        <CurrencyPicker />

        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={async () => {
            const enabling = !soundEnabled
            toggleSound()
            if (enabling) {
              await primeAudio()
              sound.toggle()
              void bgm.start()
            } else {
              bgm.stop()
            }
          }}
          aria-label={soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos'}
          aria-pressed={soundEnabled}
          title={soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos'}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/70 dark:border-white/10 bg-white/70 dark:bg-night-700/70 text-lg shadow-[var(--shadow-glass-sm)]"
        >
          {soundEnabled ? '🔊' : '🔈'}
        </motion.button>

        <motion.button
          type="button"
          whileTap={{ scale: 0.9, rotate: -12 }}
          onClick={() => {
            sound.click()
            toggleTheme()
          }}
          aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
          title={theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/70 dark:border-white/10 bg-white/70 dark:bg-night-700/70 text-lg shadow-[var(--shadow-glass-sm)]"
        >
          {theme === 'dark' ? '🌙' : '☀️'}
        </motion.button>
      </div>
    </GlassCard>
  )
}
