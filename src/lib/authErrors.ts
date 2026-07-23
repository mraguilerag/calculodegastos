const KNOWN_MESSAGES: Array<{ match: RegExp; es: string }> = [
  { match: /invalid login credentials/i, es: 'Correo o contraseña incorrectos.' },
  { match: /email not confirmed/i, es: 'Debes confirmar tu correo antes de iniciar sesión.' },
  { match: /user already registered/i, es: 'Ya existe una cuenta con este correo.' },
  { match: /password should be at least/i, es: 'La contraseña debe tener al menos 6 caracteres.' },
  { match: /unable to validate email address/i, es: 'Ese correo no parece válido.' },
  {
    match: /email rate limit/i,
    es: 'Se alcanzó el límite de envío de correos del proyecto. Espera unos minutos y vuelve a intentar.',
  },
  { match: /rate limit/i, es: 'Demasiados intentos. Espera un momento y vuelve a intentar.' },
  { match: /network/i, es: 'No se pudo conectar. Revisa tu conexión a internet.' },
]

/** Traduce errores de Supabase Auth a mensajes claros en español. */
export function translateAuthError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error)
  const known = KNOWN_MESSAGES.find((entry) => entry.match.test(message))
  return known?.es ?? 'Algo salió mal. Intenta de nuevo en un momento.'
}

/** true si el error es especificamente "correo sin confirmar" (seguro de distinguir, no revela otras cuentas). */
export function isUnconfirmedEmailError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)
  return /email not confirmed/i.test(message)
}
