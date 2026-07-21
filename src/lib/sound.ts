import { useAppStore } from '../store/useAppStore'

let ctx: AudioContext | null = null

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioCtx) return null
  if (!ctx) ctx = new AudioCtx()
  return ctx
}

/**
 * Desbloquea el AudioContext de forma confiable. Los navegadores solo permiten
 * reproducir audio despues de un gesto real del usuario (clic/tap) - hay que
 * llamar esto de forma sincronica dentro de ese gesto (ver Header, boton de sonido).
 */
export async function primeAudio(): Promise<void> {
  const audioCtx = getAudioContext()
  if (!audioCtx) return
  if (audioCtx.state === 'suspended') {
    await audioCtx.resume()
  }
  // Buffer silencioso: fuerza a algunos navegadores moviles a terminar de desbloquear el audio.
  const buffer = audioCtx.createBuffer(1, 1, audioCtx.sampleRate)
  const source = audioCtx.createBufferSource()
  source.buffer = buffer
  source.connect(audioCtx.destination)
  source.start(0)
}

interface Tone {
  freq: number
  start: number
  duration: number
  type?: OscillatorType
  gain?: number
}

async function playTones(tones: Tone[]) {
  if (!useAppStore.getState().settings.soundEnabled) return
  const audioCtx = getAudioContext()
  if (!audioCtx) return
  if (audioCtx.state === 'suspended') {
    await audioCtx.resume()
  }

  const now = audioCtx.currentTime
  for (const tone of tones) {
    const osc = audioCtx.createOscillator()
    const gainNode = audioCtx.createGain()
    osc.type = tone.type ?? 'sine'
    osc.frequency.value = tone.freq

    const startAt = now + tone.start
    const peakGain = tone.gain ?? 0.2

    gainNode.gain.setValueAtTime(0, startAt)
    gainNode.gain.linearRampToValueAtTime(peakGain, startAt + 0.015)
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startAt + tone.duration)

    osc.connect(gainNode)
    gainNode.connect(audioCtx.destination)
    osc.start(startAt)
    osc.stop(startAt + tone.duration + 0.02)
  }
}

export const sound = {
  click: () => playTones([{ freq: 720, start: 0, duration: 0.09, type: 'sine', gain: 0.16 }]),
  /** Confirmacion generica (categoria creada, presupuesto actualizado). */
  save: () =>
    playTones([
      { freq: 880, start: 0, duration: 0.14, type: 'triangle', gain: 0.2 },
      { freq: 1318.5, start: 0.09, duration: 0.2, type: 'triangle', gain: 0.18 },
    ]),
  /** "Check" ascendente y satisfactorio: especifico para agregar/editar un gasto. */
  check: () =>
    playTones([
      { freq: 1046.5, start: 0, duration: 0.1, type: 'triangle', gain: 0.2 },
      { freq: 1318.5, start: 0.07, duration: 0.1, type: 'triangle', gain: 0.2 },
      { freq: 1568.0, start: 0.14, duration: 0.22, type: 'triangle', gain: 0.22 },
    ]),
  delete: () =>
    playTones([
      { freq: 660, start: 0, duration: 0.12, type: 'sine', gain: 0.16 },
      { freq: 440, start: 0.07, duration: 0.16, type: 'sine', gain: 0.14 },
    ]),
  error: () =>
    playTones([
      { freq: 300, start: 0, duration: 0.1, type: 'sine', gain: 0.16 },
      { freq: 260, start: 0.11, duration: 0.14, type: 'sine', gain: 0.16 },
    ]),
  toggle: () => playTones([{ freq: 990, start: 0, duration: 0.07, type: 'sine', gain: 0.14 }]),
}
