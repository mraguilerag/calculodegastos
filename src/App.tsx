import { ToastProvider } from './components/ui/ToastProvider'
import { AppBackground } from './components/layout/AppBackground'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { WelcomeBanner } from './components/layout/WelcomeBanner'
import { TotalsGrid } from './components/summary/TotalsGrid'
import { PeriodNavigator } from './components/summary/PeriodNavigator'
import { ExpenseForm } from './components/expenses/ExpenseForm'
import { ExpenseHistory } from './components/expenses/ExpenseHistory'
import { CategoryChart } from './components/summary/CategoryChart'
import { BudgetWidget } from './components/summary/BudgetWidget'
import { useThemeSync } from './hooks/useThemeSync'
import { useAudioUnlock } from './hooks/useAudioUnlock'
import { usePeriodNav } from './hooks/usePeriodNav'

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
      <WelcomeBanner />
    </div>
  )
}

function App() {
  return (
    <ToastProvider>
      <AppShell />
    </ToastProvider>
  )
}

export default App
