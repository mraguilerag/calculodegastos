import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { primeAudio, sound } from '../../lib/sound'
import { bgm } from '../../lib/bgm'
import { GlassCard } from '../ui/GlassCard'

export function WelcomeGate({ children }: { children: ReactNode }) {
  const hasChosenSound = useAppStore((s) => s.settings.hasChosenSound)
  const chooseSoundPreference = useAppStore((s) => s.chooseSoundPreference)

  if (hasChosenSound) return <>{children}</>

  async function choose(enabled: boolean) {
    await primeAudio()
    chooseSoundPreference(enabled)
    if (enabled) {
      sound.check()
      void bgm.start()
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-b from-lavender-200 via-pink-200 to-gold-200 p-4 dark:from-night-950 dark:via-night-900 dark:to-night-800">
      <GlassCard padding="lg" tilt={false} className="w-full max-w-md text-center">
        <span className="text-4xl" aria-hidden>
          🐾
        </span>
        <h1 className="mt-3 font-display text-3xl text-pink-600 dark:text-pink-300">Michi Gastos</h1>
        <p className="mt-4 font-heading text-lg font-semibold text-ink-700 dark:text-pink-100">
          ¿Con sonido o sin sonido?
        </p>
        <p className="mt-1 text-sm text-ink-500 dark:text-pink-200/60">
          Puedes cambiarlo despues desde el boton de sonido del encabezado.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <motion.button
            type="button"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => choose(true)}
            className="flex-1 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 px-6 py-4 font-heading text-lg font-semibold text-white shadow-[var(--shadow-glass-lg)]"
          >
            🔊 Con sonido
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => choose(false)}
            className="flex-1 rounded-full border-2 border-white/70 bg-white/70 px-6 py-4 font-heading text-lg font-semibold text-ink-700 shadow-[var(--shadow-glass)] dark:border-white/10 dark:bg-night-700/70 dark:text-pink-100"
          >
            🔈 Sin sonido
          </motion.button>
        </div>
      </GlassCard>
    </div>
  )
}
