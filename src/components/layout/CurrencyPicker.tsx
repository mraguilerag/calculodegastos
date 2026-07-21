import { useAppStore } from '../../store/useAppStore'
import { CURRENCIES } from '../../data/currencies'
import { sound } from '../../lib/sound'

export function CurrencyPicker() {
  const code = useAppStore((s) => s.settings.currency)
  const setCurrency = useAppStore((s) => s.setCurrency)

  return (
    <label className="relative flex h-11 items-center rounded-full border border-white/70 dark:border-white/10 bg-white/70 dark:bg-night-700/70 px-3 shadow-[var(--shadow-glass-sm)]">
      <span className="sr-only">Moneda</span>
      <select
        value={code}
        onChange={(e) => {
          sound.click()
          setCurrency(e.target.value)
        }}
        aria-label="Moneda"
        title="Moneda"
        className="appearance-none bg-transparent pr-4 font-heading text-sm font-semibold text-ink-700 dark:text-pink-100 focus:outline-none"
      >
        {CURRENCIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.symbol} {c.code}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 text-xs text-ink-400 dark:text-pink-200/50">▾</span>
    </label>
  )
}
