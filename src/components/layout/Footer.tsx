import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAppStore } from '../../store/useAppStore'
import { useSessionStore } from '../../store/useSessionStore'
import { useExchangeRateStore } from '../../store/useExchangeRateStore'
import { exportExpensesToCsv } from '../../lib/exportData'
import { useToast } from '../ui/ToastProvider'
import { sound } from '../../lib/sound'
import { ConfirmDialog } from '../ui/ConfirmDialog'

export function Footer() {
  const expenses = useAppStore((s) => s.expenses)
  const categories = useAppStore((s) => s.categories)
  const deleteAllData = useAppStore((s) => s.deleteAllData)
  const sessionMode = useSessionStore((s) => s.mode)
  const signOut = useSessionStore((s) => s.signOut)
  const ratesStatus = useExchangeRateStore((s) => s.status)
  const ratesFetchedAt = useExchangeRateStore((s) => s.fetchedAt)
  const { showToast } = useToast()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  function handleExport() {
    if (expenses.length === 0) {
      sound.error()
      showToast('Todavía no hay gastos para exportar', { variant: 'error' })
      return
    }
    exportExpensesToCsv(expenses, categories)
    sound.click()
    showToast('Datos exportados', { icon: '⬇️' })
  }

  async function handleConfirmDelete() {
    setDeleting(true)
    try {
      await deleteAllData()
      sound.delete()
      await signOut()
    } catch (err) {
      sound.error()
      showToast(err instanceof Error ? err.message : 'No se pudo eliminar la cuenta.', { variant: 'error' })
    } finally {
      setDeleting(false)
      setDeleteOpen(false)
    }
  }

  return (
    <footer className="flex flex-col items-center gap-2 py-6 text-center text-xs text-ink-500 dark:text-pink-200/50">
      <p>
        Mis Gastos &middot;{' '}
        {sessionMode === 'cloud'
          ? 'tus datos se guardan en tu cuenta'
          : 'tus datos se guardan solo en este navegador'}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        <button
          type="button"
          onClick={handleExport}
          className="font-heading font-semibold text-pink-600 underline underline-offset-2 dark:text-pink-300"
        >
          Exportar mis datos (CSV)
        </button>
        {sessionMode === 'cloud' && (
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="font-heading font-semibold text-rose-500 underline underline-offset-2 dark:text-rose-300"
          >
            Eliminar cuenta
          </button>
        )}
      </div>

      {ratesStatus === 'unavailable' && (
        <p className="text-rose-500 dark:text-rose-300">
          No se pudo obtener la tasa de cambio: los montos en otras monedas se muestran sin convertir.
        </p>
      )}
      {ratesStatus === 'stale' && ratesFetchedAt !== null && (
        <p className="text-amber-600 dark:text-amber-300">
          Tasas de cambio actualizadas hace {formatDistanceToNow(ratesFetchedAt, { locale: es })} — puede haber
          pequeñas diferencias.
        </p>
      )}
      <p className="text-[0.65rem] text-ink-400 dark:text-pink-200/30">
        Tasas de cambio via{' '}
        <a
          href="https://www.exchangerate-api.com"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2"
        >
          exchangerate-api.com
        </a>
      </p>

      <ConfirmDialog
        open={deleteOpen}
        title="Eliminar cuenta"
        description="Esta accion es irreversible: se borraran todos tus gastos, categorias y tu perfil. Vas a cerrar sesion y no vas a poder recuperar estos datos."
        confirmLabel={deleting ? 'Eliminando...' : 'Eliminar todo'}
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </footer>
  )
}
