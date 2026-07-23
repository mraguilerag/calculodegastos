import { useCallback } from 'react'
import { useAppStore } from '../store/useAppStore'
import { useExchangeRateStore } from '../store/useExchangeRateStore'

/** Devuelve una funcion estable que convierte un monto desde su moneda original a la moneda de visualizacion activa. */
export function useConvert() {
  const displayCurrency = useAppStore((s) => s.settings.currency)
  const convert = useExchangeRateStore((s) => s.convert)
  return useCallback(
    (amount: number, fromCurrency: string) => convert(amount, fromCurrency, displayCurrency),
    [convert, displayCurrency]
  )
}
