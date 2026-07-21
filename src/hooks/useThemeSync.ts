import { useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'

export function useThemeSync() {
  const theme = useAppStore((s) => s.settings.theme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])
}
