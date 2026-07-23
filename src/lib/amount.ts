import type { Currency } from '../data/currencies'

/**
 * Interpreta un monto escrito a mano. Tanto '.' como ',' se aceptan como
 * separador de miles; el ultimo separador se interpreta como decimal solo
 * si la moneda usa decimales y le siguen 1-2 digitos (ej. "15.50" -> 15.5,
 * pero "30.300" -> 30300 porque le siguen 3 digitos, o porque la moneda no
 * usa decimales). Devuelve NaN si el texto no tiene un formato valido.
 */
export function parseAmountInput(raw: string, currency: Currency): number {
  const cleaned = raw.trim().replace(/[^0-9.,]/g, '')
  if (!cleaned) return NaN

  const separators = [...cleaned.matchAll(/[.,]/g)]
  if (separators.length === 0) return Number(cleaned)

  const last = separators[separators.length - 1]
  const lastIndex = last.index ?? 0
  const trailingDigits = cleaned.length - lastIndex - 1
  const looksDecimal = currency.decimals > 0 && trailingDigits > 0 && trailingDigits <= 2

  if (looksDecimal) {
    const integerPart = cleaned.slice(0, lastIndex).replace(/[.,]/g, '')
    const fractionPart = cleaned.slice(lastIndex + 1)
    return Number(`${integerPart || '0'}.${fractionPart}`)
  }

  return Number(cleaned.replace(/[.,]/g, ''))
}

export function amountErrorMessage(currency: Currency): string {
  return currency.decimals === 0
    ? 'Ingresa un monto valido, ej: 30.300'
    : 'Ingresa un monto valido, ej: 15.50'
}
