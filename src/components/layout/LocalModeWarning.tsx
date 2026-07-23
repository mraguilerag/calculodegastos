import { GlassCard } from '../ui/GlassCard'
import { Button } from '../ui/Button'
import { CenteredScreen } from './CenteredScreen'

interface LocalModeWarningProps {
  onContinueLocal: () => void
  onCreateAccount: () => void
}

export function LocalModeWarning({ onContinueLocal, onCreateAccount }: LocalModeWarningProps) {
  return (
    <CenteredScreen>
      <GlassCard padding="lg" tilt={false} className="text-center">
        <span className="text-4xl" aria-hidden>
          🌸
        </span>
        <h2 className="mt-3 font-heading text-lg font-semibold text-ink-900 dark:text-pink-50">Un momento...</h2>
        <p className="mt-2 text-sm text-ink-500 dark:text-pink-200/70">
          Si continúas sin una cuenta, tus datos se guardan solo en este navegador y existe riesgo de
          perderlos si borras el historial o cambias de dispositivo. Te recomendamos crear una cuenta, o
          recuerda que puedes exportar tus datos en cualquier momento desde el botón al final de la página.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <Button onClick={onCreateAccount} className="w-full">
            Crear cuenta
          </Button>
          <Button variant="secondary" onClick={onContinueLocal} className="w-full">
            Continuar sin cuenta
          </Button>
        </div>
      </GlassCard>
    </CenteredScreen>
  )
}
