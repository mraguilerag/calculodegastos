import { useAppStore } from '../store/useAppStore'
import { getCurrency, type Currency } from '../data/currencies'

export function useCurrency(): Currency {
  const code = useAppStore((s) => s.settings.currency)
  return getCurrency(code)
}
