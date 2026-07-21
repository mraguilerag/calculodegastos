export interface Category {
  id: string
  name: string
  icon: string
  color: string
  isDefault: boolean
}

export interface Expense {
  id: string
  amount: number
  categoryId: string
  description: string
  /** ISO date string, yyyy-MM-dd (fecha local, no UTC) */
  date: string
  createdAt: number
}

export interface Budget {
  monthlyLimit: number | null
}

export interface Settings {
  theme: 'light' | 'dark'
  soundEnabled: boolean
  /** Codigo de moneda (ISO 4217), ver src/data/currencies.ts */
  currency: string
  /** Si ya se mostro y cerro el mensaje de bienvenida */
  hasSeenWelcome: boolean
}

export interface Totals {
  today: number
  week: number
  month: number
  year: number
}
