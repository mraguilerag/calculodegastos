import { useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'
import { primeAudio } from '../lib/sound'
import { bgm } from '../lib/bgm'

/**
 * Los navegadores bloquean el audio hasta el primer gesto real del usuario
 * en la sesion. Este hook desbloquea el AudioContext y arranca la musica de
 * fondo apenas ocurre esa primera interaccion (clic o tecla), sin necesidad
 * de una pantalla previa que pregunte nada.
 */
export function useAudioUnlock() {
  const soundEnabled = useAppStore((s) => s.settings.soundEnabled)

  useEffect(() => {
    if (!soundEnabled) return

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
  }, [soundEnabled])
}
