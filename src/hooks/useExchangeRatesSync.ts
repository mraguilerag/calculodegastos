import { useEffect } from 'react'
import { useExchangeRateStore } from '../store/useExchangeRateStore'

/** Al montar la app, pide tasas de cambio frescas si el cache tiene mas de 24h. */
export function useExchangeRatesSync() {
  const ensureFresh = useExchangeRateStore((s) => s.ensureFresh)

  useEffect(() => {
    void ensureFresh()
  }, [ensureFresh])
}
