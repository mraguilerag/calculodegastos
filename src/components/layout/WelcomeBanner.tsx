import { GlassCard } from '../ui/GlassCard'
import { Button } from '../ui/Button'
import { CenteredScreen } from './CenteredScreen'

interface WelcomeBannerProps {
  onLogin: () => void
  onContinueWithoutAccount: () => void
}

export function WelcomeBanner({ onLogin, onContinueWithoutAccount }: WelcomeBannerProps) {
  return (
    <CenteredScreen>
      <GlassCard padding="lg" tilt={false} className="text-center">
        <span className="text-4xl" aria-hidden>
          💗
        </span>
        <h1 className="mt-3 font-heading text-xl font-semibold text-ink-900 dark:text-pink-50">
          Te damos la bienvenida a Mis Gastos
        </h1>
        <p className="mt-2 text-sm text-ink-500 dark:text-pink-200/70">
          Un lugar simple y bonito para llevar tus finanzas del día a día.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <Button onClick={onLogin} className="w-full">
            Iniciar sesión
          </Button>
          <Button variant="secondary" onClick={onContinueWithoutAccount} className="w-full">
            Continuar sin cuenta
          </Button>
        </div>
      </GlassCard>
    </CenteredScreen>
  )
}
