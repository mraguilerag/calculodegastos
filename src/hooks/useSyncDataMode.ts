import { useEffect, useRef } from 'react'
import { useSessionStore } from '../store/useSessionStore'
import { useAppStore } from '../store/useAppStore'
import { useToast } from '../components/ui/ToastProvider'

/**
 * Conecta la sesion (Supabase) con el store de datos: cuando hay sesion,
 * carga los datos de la nube (y migra datos locales pendientes si
 * corresponde); cuando no, vuelve a modo local.
 */
export function useSyncDataMode() {
  const mode = useSessionStore((s) => s.mode)
  const userId = useSessionStore((s) => s.user?.id ?? null)
  const { showToast } = useToast()
  const lastSyncedUserId = useRef<string | null>(null)

  useEffect(() => {
    if (mode === 'cloud' && userId) {
      if (lastSyncedUserId.current === userId) return
      lastSyncedUserId.current = userId
      useAppStore
        .getState()
        .loadFromCloud(userId)
        .then((migratedCount) => {
          if (migratedCount > 0) {
            showToast(`Se importaron ${migratedCount} gastos locales a tu cuenta`, { icon: '☁️' })
          }
        })
        .catch((err) => {
          console.error('[useSyncDataMode] loadFromCloud failed:', err)
          showToast('No se pudieron cargar tus datos. Intenta recargar la página.', { variant: 'error' })
        })
    } else if (mode === 'local') {
      lastSyncedUserId.current = null
      useAppStore.getState().switchToLocalMode()
    }
  }, [mode, userId, showToast])
}
