export interface Currency {
  code: string
  name: string
  symbol: string
  locale: string
  decimals: number
}

export const CURRENCIES: Currency[] = [
  { code: 'USD', name: 'Dólar estadounidense', symbol: '$', locale: 'en-US', decimals: 2 },
  { code: 'EUR', name: 'Euro', symbol: '€', locale: 'es-ES', decimals: 2 },
  { code: 'MXN', name: 'Peso mexicano', symbol: '$', locale: 'es-MX', decimals: 2 },
  { code: 'ARS', name: 'Peso argentino', symbol: '$', locale: 'es-AR', decimals: 2 },
  { code: 'CLP', name: 'Peso chileno', symbol: '$', locale: 'es-CL', decimals: 0 },
  { code: 'COP', name: 'Peso colombiano', symbol: '$', locale: 'es-CO', decimals: 0 },
  { code: 'PEN', name: 'Sol peruano', symbol: 'S/', locale: 'es-PE', decimals: 2 },
  { code: 'BRL', name: 'Real brasileño', symbol: 'R$', locale: 'pt-BR', decimals: 2 },
  { code: 'UYU', name: 'Peso uruguayo', symbol: '$U', locale: 'es-UY', decimals: 2 },
  { code: 'BOB', name: 'Boliviano', symbol: 'Bs', locale: 'es-BO', decimals: 2 },
  { code: 'GTQ', name: 'Quetzal guatemalteco', symbol: 'Q', locale: 'es-GT', decimals: 2 },
  { code: 'GBP', name: 'Libra esterlina', symbol: '£', locale: 'en-GB', decimals: 2 },
]

export const DEFAULT_CURRENCY_CODE = 'USD'

export function getCurrency(code: string): Currency {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0]
}
