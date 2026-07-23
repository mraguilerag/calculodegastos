import { motion } from 'framer-motion'
import type { PeriodNav } from '../../hooks/usePeriodNav'
import type { Granularity } from '../../lib/periods'
import { GlassCard } from '../ui/GlassCard'
import { sound } from '../../lib/sound'
import { cn } from '../../lib/cn'

const TABS: Array<{ value: Granularity; label: string }> = [
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mes' },
  { value: 'year', label: 'Año' },
]

interface PeriodNavigatorProps {
  nav: PeriodNav
}

export function PeriodNavigator({ nav }: PeriodNavigatorProps) {
  return (
    <GlassCard padding="sm" tilt={false} className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex gap-1.5" role="radiogroup" aria-label="Periodo a explorar">
        {TABS.map((tab) => {
          const active = tab.value === nav.granularity
          return (
            <button
              key={tab.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => {
                sound.click()
                nav.setGranularity(tab.value)
              }}
              className={cn(
                'rounded-full px-3.5 py-1.5 font-heading text-sm font-semibold transition-all duration-200',
                active
                  ? 'bg-pink-400/25 text-pink-700 shadow-[0_0_0_2px_rgba(242,107,168,0.4)] dark:bg-pink-400/20 dark:text-pink-100'
                  : 'text-ink-500 hover:bg-white/60 dark:text-pink-200/60 dark:hover:bg-white/10'
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="flex flex-1 items-center justify-center gap-2 sm:flex-none">
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            sound.click()
            nav.goPrev()
          }}
          aria-label="Periodo anterior"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/70 text-ink-600 shadow-[var(--shadow-glass-sm)] dark:bg-night-700/70 dark:text-pink-100"
        >
          ‹
        </motion.button>

        <span className="min-w-[10rem] text-center font-heading text-sm font-semibold text-ink-900 dark:text-pink-50 sm:text-base">
          {nav.label}
        </span>

        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            sound.click()
            nav.goNext()
          }}
          aria-label="Periodo siguiente"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/70 text-ink-600 shadow-[var(--shadow-glass-sm)] disabled:opacity-30 dark:bg-night-700/70 dark:text-pink-100"
        >
          ›
        </motion.button>
      </div>

      <div className="flex w-[4.5rem] justify-end">
        {!nav.isCurrent && (
          <button
            type="button"
            onClick={() => {
              sound.click()
              nav.goToday()
            }}
            className="rounded-full border border-white/70 bg-white/60 px-3 py-1.5 font-heading text-xs font-semibold text-pink-600 shadow-[var(--shadow-glass-sm)] dark:border-white/10 dark:bg-night-700/60 dark:text-pink-200"
          >
            Hoy
          </button>
        )}
      </div>
    </GlassCard>
  )
}
