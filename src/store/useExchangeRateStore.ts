import { create } from 'zustand'

const CACHE_KEY = 'mis-gastos:exchange-rates'
const MAX_AGE_MS = 24 * 60 * 60 * 1000
const RATES_URL = 'https://open.er-api.com/v6/latest/USD'

interface CachedRates {
  base: string
  rates: Record<string, number>
  fetchedAt: number
}

function readCache(): CachedRates | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.rates || typeof parsed.fetchedAt !== 'number') return null
    return parsed as CachedRates
  } catch {
    return null
  }
}

function writeCache(data: CachedRates) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data))
  } catch {
    // localStorage no disponible (modo privado, etc.) - la app sigue funcionando sin cache persistente
  }
}

export type RatesStatus = 'loading' | 'ready' | 'stale' | 'unavailable'

interface ExchangeRateState {
  rates: Record<string, number> | null
  fetchedAt: number | null
  status: RatesStatus
  /** Pide tasas frescas si el cache tiene mas de 24h (o no existe). Segura de llamar seguido. */
  ensureFresh: () => Promise<void>
  /** Convierte un monto entre monedas via cruce por USD. Si falta alguna tasa, devuelve el monto sin convertir. */
  convert: (amount: number, from: string, to: string) => number
}

const initialCache = readCache()

export const useExchangeRateStore = create<ExchangeRateState>((set, get) => ({
  rates: initialCache?.rates ?? null,
  fetchedAt: initialCache?.fetchedAt ?? null,
  status: initialCache ? (Date.now() - initialCache.fetchedAt < MAX_AGE_MS ? 'ready' : 'stale') : 'loading',

  ensureFresh: async () => {
    const { fetchedAt } = get()
    if (fetchedAt !== null && Date.now() - fetchedAt < MAX_AGE_MS) return

    try {
      const res = await fetch(RATES_URL)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (data?.result !== 'success' || !data.rates) throw new Error('Respuesta invalida')

      const cached: CachedRates = {
        base: data.base_code ?? 'USD',
        rates: data.rates,
        fetchedAt: Date.now(),
      }
      writeCache(cached)
      set({ rates: cached.rates, fetchedAt: cached.fetchedAt, status: 'ready' })
    } catch {
      set((state) => ({ status: state.rates ? 'stale' : 'unavailable' }))
    }
  },

  convert: (amount, from, to) => {
    if (from === to) return amount
    const { rates } = get()
    if (!rates || !rates[from] || !rates[to]) return amount
    return (amount / rates[from]) * rates[to]
  },
}))
