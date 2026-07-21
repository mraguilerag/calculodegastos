import { useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'
import { primeAudio } from '../lib/sound'
import { bgm } from '../lib/bgm'

/**
 * Red de seguridad para sesiones que regresan: si el usuario ya eligio "con
 * sonido" en una visita anterior, el navegador igual bloquea el audio hasta
 * el primer gesto real de ESTA sesion. Este hook desbloquea el AudioContext
 * y arranca la musica de fondo apenas ocurre esa primera interaccion.
 */
export function useAudioUnlock() {
  const hasChosenSound = useAppStore((s) => s.settings.hasChosenSound)
  const soundEnabled = useAppStore((s) => s.settings.soundEnabled)

  useEffect(() => {
    if (!hasChosenSound || !soundEnabled) return

    let unlocked = false
    function handleFirstGesture() {
      if (unlocked) return
      unlocked = true
      void primeAudio().then(() => bgm.start())
      window.removeEventListener('pointerdown', handleFirstGesture)
      window.removeEventListener('keydown', handleFirstGesture)
    }

    window.addEventListener('pointerdown', handleFirstGesture, { once: true })
    window.addEventListener('keydown', handleFirstGesture, { once: true })

    return () => {
      window.removeEventListener('pointerdown', handleFirstGesture)
      window.removeEventListener('keydown', handleFirstGesture)
    }
  }, [hasChosenSound, soundEnabled])
}
