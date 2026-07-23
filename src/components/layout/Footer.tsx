import { useAppStore } from '../../store/useAppStore'
import { useSessionStore } from '../../store/useSessionStore'
import { exportExpensesToCsv } from '../../lib/exportData'
import { useToast } from '../ui/ToastProvider'
import { sound } from '../../lib/sound'

export function Footer() {
  const expenses = useAppStore((s) => s.expenses)
  const categories = useAppStore((s) => s.categories)
  const currencyCode = useAppStore((s) => s.settings.currency)
  const sessionMode = useSessionStore((s) => s.mode)
  const { showToast } = useToast()

  function handleExport() {
    if (expenses.length === 0) {
      sound.error()
      showToast('Todavía no hay gastos para exportar', { variant: 'error' })
      return
    }
    exportExpensesToCsv(expenses, categories, currencyCode)
    sound.click()
    showToast('Datos exportados', { icon: '⬇️' })
  }

  return (
    <footer className="flex flex-col items-center gap-2 py-6 text-center text-xs text-ink-500 dark:text-pink-200/50">
      <p>
        Mis Gastos &middot;{' '}
        {sessionMode === 'cloud'
          ? 'tus datos se guardan en tu cuenta'
          : 'tus datos se guardan solo en este navegador'}
      </p>
      <button
        type="button"
        onClick={handleExport}
        className="font-heading font-semibold text-pink-600 underline underline-offset-2 dark:text-pink-300"
      >
        Exportar mis datos (CSV)
      </button>
    </footer>
  )
}
