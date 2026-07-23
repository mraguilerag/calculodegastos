const KEY = 'mis-gastos:pending-migration'

/**
 * Se marca al registrarse desde el modo local (antes de que exista sesion,
 * porque el registro exige confirmar el correo). Se consume en el primer
 * inicio de sesion real para subir los datos locales a la cuenta nueva.
 */
export function markPendingMigration(): void {
  try {
    localStorage.setItem(KEY, 'true')
  } catch {
    // localStorage no disponible - la migracion simplemente no se ofrecera
  }
}

export function consumePendingMigration(): boolean {
  try {
    const value = localStorage.getItem(KEY) === 'true'
    localStorage.removeItem(KEY)
    return value
  } catch {
    return false
  }
}
