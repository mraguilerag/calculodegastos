import { useState } from 'react'
import { ToastProvider } from './components/ui/ToastProvider'
import { AppBackground } from './components/layout/AppBackground'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { WelcomeBanner } from './components/layout/WelcomeBanner'
import { LocalModeWarning } from './components/layout/LocalModeWarning'
import { LoadingSplash } from './components/layout/LoadingSplash'
import { AuthScreen } from './components/auth/AuthScreen'
import { NamePrompt } from './components/auth/NamePrompt'
import { TotalsGrid } from './components/summary/TotalsGrid'
import { PeriodNavigator } from './components/summary/PeriodNavigator'
import { ExpenseForm } from './components/expenses/ExpenseForm'
import { ExpenseHistory } from './components/expenses/ExpenseHistory'
import { CategoryChart } from './components/summary/CategoryChart'
import { BudgetWidget } from './components/summary/BudgetWidget'
import { useThemeSync } from './hooks/useThemeSync'
import { useAudioUnlock } from './hooks/useAudioUnlock'
import { usePeriodNav } from './hooks/usePeriodNav'
import { useSyncDataMode } from './hooks/useSyncDataMode'
import { useSessionStore } from './store/useSessionStore'
import { useAppStore } from './store/useAppStore'

function AppShell() {
  useThemeSync()
  useAudioUnlock()
  const periodNav = usePeriodNav()

  return (
    <div className="relative min-h-screen">
      <AppBackground />
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-5 px-4 py-5 sm:px-6 sm:py-8">
        <Header />
        <TotalsGrid />
        <PeriodNavigator nav={periodNav} />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="flex flex-col gap-5">
            <ExpenseForm />
            <ExpenseHistory nav={periodNav} />
          </div>
          <div className="flex flex-col gap-5">
            <CategoryChart nav={periodNav} />
            <BudgetWidget />
          </div>
        </div>
        <Footer />
      </div>
    </div>
  )
}

type PreAuthStep = 'welcome' | 'localWarning' | 'auth'

function AppRoot() {
  useSyncDataMode()
  const mode = useSessionStore((s) => s.mode)
  const chooseLocalMode = useSessionStore((s) => s.chooseLocalMode)
  const authRequested = useSessionStore((s) => s.authRequested)
  const dismissAuthRequest = useSessionStore((s) => s.dismissAuthRequest)
  const profileName = useAppStore((s) => s.profileName)
  const setProfileName = useAppStore((s) => s.setProfileName)
  const [step, setStep] = useState<PreAuthStep>('welcome')
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login')

  if (mode === 'loading') return <LoadingSplash />

  if (mode === 'local' && authRequested) {
    return <AuthScreen initialTab="login" onBack={dismissAuthRequest} />
  }

  if (mode === 'cloud') {
    if (profileName === null) {
      return <NamePrompt onSubmit={(name) => void setProfileName(name)} onSkip={() => void setProfileName('')} />
    }
    return <AppShell />
  }

  if (mode === 'local') return <AppShell />

  // mode === 'undecided'
  if (step === 'localWarning') {
    return (
      <LocalModeWarning
        onContinueLocal={chooseLocalMode}
        onCreateAccount={() => {
          setAuthTab('signup')
          setStep('auth')
        }}
      />
    )
  }

  if (step === 'auth') {
    return <AuthScreen initialTab={authTab} onBack={() => setStep('welcome')} />
  }

  return (
    <WelcomeBanner
      onLogin={() => {
        setAuthTab('login')
        setStep('auth')
      }}
      onContinueWithoutAccount={() => setStep('localWarning')}
    />
  )
}

function App() {
  return (
    <ToastProvider>
      <AppRoot />
    </ToastProvider>
  )
}

export default App
