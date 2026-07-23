import { useEffect, useState, type FormEvent } from 'react'
import { GlassCard } from '../ui/GlassCard'
import { Button } from '../ui/Button'
import { Field, inputClasses } from '../ui/Field'
import { CenteredScreen } from '../layout/CenteredScreen'
import { GoogleButton } from './GoogleButton'
import { supabase, isCloudConfigured } from '../../lib/supabaseClient'
import { translateAuthError, isUnconfirmedEmailError } from '../../lib/authErrors'
import { markPendingMigration } from '../../lib/pendingMigration'
import { useAppStore } from '../../store/useAppStore'
import { sound } from '../../lib/sound'
import { cn } from '../../lib/cn'

const RESEND_COOLDOWN_SECONDS = 30

type Tab = 'login' | 'signup'

interface AuthScreenProps {
  initialTab: Tab
  onBack: () => void
}

function tabClass(active: boolean) {
  return cn(
    'flex-1 rounded-full py-2 font-heading text-sm font-semibold transition-all',
    active
      ? 'bg-white text-pink-600 shadow-[var(--shadow-glass-sm)] dark:bg-night-700 dark:text-pink-200'
      : 'text-ink-500 dark:text-pink-200/60'
  )
}

export function AuthScreen({ initialTab, onBack }: AuthScreenProps) {
  const [tab, setTab] = useState<Tab>(initialTab)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showResend, setShowResend] = useState(false)
  const [signupDone, setSignupDone] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => setResendCooldown((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  async function handleResend() {
    if (resendCooldown > 0 || !email) return
    setError(null)
    try {
      const { error: resendError } = await supabase!.auth.resend({ type: 'signup', email })
      if (resendError) throw resendError
      setResendCooldown(RESEND_COOLDOWN_SECONDS)
    } catch (err) {
      setError(translateAuthError(err))
    }
  }

  if (!isCloudConfigured) {
    return (
      <CenteredScreen>
        <GlassCard padding="lg" tilt={false} className="text-center">
          <span className="text-4xl" aria-hidden>
            🛠️
          </span>
          <h2 className="mt-3 font-heading text-lg font-semibold text-ink-900 dark:text-pink-50">
            Las cuentas todavía no están listas
          </h2>
          <p className="mt-2 text-sm text-ink-500 dark:text-pink-200/70">
            Falta configurar la conexión con la base de datos. Mientras tanto puedes seguir usando la app sin
            cuenta.
          </p>
          <Button variant="secondary" onClick={onBack} className="mt-6 w-full">
            Volver
          </Button>
        </GlassCard>
      </CenteredScreen>
    )
  }

  if (signupDone) {
    return (
      <CenteredScreen>
        <GlassCard padding="lg" tilt={false} className="text-center">
          <span className="text-4xl" aria-hidden>
            💌
          </span>
          <h2 className="mt-3 font-heading text-lg font-semibold text-ink-900 dark:text-pink-50">
            Revisa tu correo
          </h2>
          <p className="mt-2 text-sm text-ink-500 dark:text-pink-200/70">
            Te enviamos un link de confirmación a <strong>{email}</strong>. Ábrelo para activar tu cuenta y
            luego inicia sesión aquí.
          </p>
          {error && <p className="mt-3 text-sm font-medium text-rose-600 dark:text-rose-300">{error}</p>}
          <Button
            variant="secondary"
            onClick={() => {
              setSignupDone(false)
              setTab('login')
            }}
            className="mt-6 w-full"
          >
            Ya confirmé, iniciar sesión
          </Button>
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0}
            className="mt-3 w-full text-center font-heading text-xs font-semibold text-pink-600 underline underline-offset-2 disabled:no-underline disabled:opacity-50 dark:text-pink-300"
          >
            {resendCooldown > 0
              ? `Correo reenviado · espera ${resendCooldown}s`
              : 'Reenviar correo de confirmación'}
          </button>
        </GlassCard>
      </CenteredScreen>
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setShowResend(false)
    setLoading(true)
    try {
      if (tab === 'login') {
        const { error: signInError } = await supabase!.auth.signInWithPassword({ email, password })
        if (signInError) throw signInError
        sound.check()
        // la sesion activa la maneja el listener global (useSessionStore)
      } else {
        const state = useAppStore.getState()
        const hasLocalData = state.expenses.length > 0 || state.categories.some((c) => !c.isDefault)
        const { error: signUpError } = await supabase!.auth.signUp({ email, password })
        if (signUpError) throw signUpError
        if (hasLocalData) markPendingMigration()
        sound.check()
        setSignupDone(true)
      }
    } catch (err) {
      sound.error()
      setError(translateAuthError(err))
      setShowResend(isUnconfirmedEmailError(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setError(null)
    try {
      const { error: oauthError } = await supabase!.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      })
      if (oauthError) throw oauthError
    } catch (err) {
      setError(translateAuthError(err))
    }
  }

  return (
    <CenteredScreen>
      <GlassCard padding="lg" tilt={false}>
        <div className="flex gap-1.5 rounded-full bg-white/50 p-1 dark:bg-night-900/40">
          <button
            type="button"
            onClick={() => {
              setTab('login')
              setError(null)
              setShowResend(false)
            }}
            className={tabClass(tab === 'login')}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('signup')
              setError(null)
              setShowResend(false)
            }}
            className={tabClass(tab === 'signup')}
          >
            Crear cuenta
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          <Field label="Correo" htmlFor="auth-email">
            <input
              id="auth-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClasses}
              placeholder="tu@correo.com"
            />
          </Field>
          <Field label="Contraseña" htmlFor="auth-password">
            <input
              id="auth-password"
              type="password"
              required
              minLength={6}
              autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClasses}
              placeholder="••••••••"
            />
          </Field>

          {error && <p className="text-sm font-medium text-rose-600 dark:text-rose-300">{error}</p>}

          {showResend && (
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className="-mt-2 text-left font-heading text-xs font-semibold text-pink-600 underline underline-offset-2 disabled:no-underline disabled:opacity-50 dark:text-pink-300"
            >
              {resendCooldown > 0
                ? `Correo reenviado · espera ${resendCooldown}s`
                : 'Reenviar correo de confirmación'}
            </button>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Un momento...' : tab === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3 font-heading text-xs text-ink-400 dark:text-pink-200/40">
          <span className="h-px flex-1 bg-ink-200/50 dark:bg-white/10" />o
          <span className="h-px flex-1 bg-ink-200/50 dark:bg-white/10" />
        </div>

        <GoogleButton onClick={handleGoogle} />

        <button
          type="button"
          onClick={onBack}
          className="mt-5 w-full text-center font-heading text-xs font-semibold text-pink-600 underline underline-offset-2 dark:text-pink-300"
        >
          Volver
        </button>
      </GlassCard>
    </CenteredScreen>
  )
}
