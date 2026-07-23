import { useEffect } from 'react'
import { primeAudio } from '../lib/sound'

/**
 * Los navegadores bloquean el audio hasta el primer gesto real del usuario
 * en la sesion. Este hook desbloquea el AudioContext apenas ocurre esa
 * primera interaccion (clic o tecla), para que los sonidos de interaccion
 * (guardar, borrar, etc.) suenen sin retraso desde el primer uso.
 */
export function useAudioUnlock() {
  useEffect(() => {
    let unlocked = false
    function handleFirstGesture() {
      if (unlocked) return
      unlocked = true
      void primeAudio()
      window.removeEventListener('pointerdown', handleFirstGesture)
      window.removeEventListener('keydown', handleFirstGesture)
    }

    window.addEventListener('pointerdown', handleFirstGesture, { once: true })
    window.addEventListener('keydown', handleFirstGesture, { once: true })

    return () => {
      window.removeEventListener('pointerdown', handleFirstGesture)
      window.removeEventListener('keydown', handleFirstGesture)
    }
  }, [])
}
