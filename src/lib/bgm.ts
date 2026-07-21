import { getAudioContext } from './sound'

/**
 * Musica de fondo estilo chiptune, en loop suave.
 *
 * Para usar tu propia pista con licencia: coloca el archivo en
 * `public/bgm.mp3` (o .ogg) y se reproducira automaticamente en vez del
 * placeholder sintetizado de abajo - no requiere cambios de codigo.
 */
const BGM_SRC = '/bgm.mp3'
const BGM_VOLUME = 0.14
const FALLBACK_VOLUME = 0.055

// Placeholder honesto: arpegio corto y alegre (pentatonica mayor), NO es una
// composicion pulida - solo relleno hasta que se agregue BGM_SRC.
const FALLBACK_NOTES: number[] = [523.25, 659.25, 783.99, 659.25, 587.33, 783.99, 659.25, 523.25]
const NOTE_DURATION = 0.42
const NOTE_GAP = 0.05

let htmlAudio: HTMLAudioElement | null = null
let usingFallback = false
let fallbackRunning = false
let fallbackTimer: number | null = null
let fallbackGain: GainNode | null = null
let stopped = true

function scheduleFallbackLoop() {
  const ctx = getAudioContext()
  if (!ctx || stopped) return

  if (!fallbackGain) {
    fallbackGain = ctx.createGain()
    fallbackGain.gain.value = FALLBACK_VOLUME
    fallbackGain.connect(ctx.destination)
  }

  const now = ctx.currentTime
  FALLBACK_NOTES.forEach((freq, i) => {
    const start = now + i * (NOTE_DURATION + NOTE_GAP)
    const osc = ctx.createOscillator()
    osc.type = 'square'
    osc.frequency.value = freq
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, start)
    g.gain.linearRampToValueAtTime(1, start + 0.02)
    g.gain.exponentialRampToValueAtTime(0.001, start + NOTE_DURATION)
    osc.connect(g)
    g.connect(fallbackGain as GainNode)
    osc.start(start)
    osc.stop(start + NOTE_DURATION + 0.02)
  })

  const totalMs = FALLBACK_NOTES.length * (NOTE_DURATION + NOTE_GAP) * 1000
  fallbackTimer = window.setTimeout(scheduleFallbackLoop, totalMs)
}

function switchToFallback() {
  usingFallback = true
  htmlAudio = null
  if (!fallbackRunning && !stopped) {
    fallbackRunning = true
    scheduleFallbackLoop()
  }
}

export const bgm = {
  async start() {
    stopped = false

    if (usingFallback) {
      if (!fallbackRunning) {
        fallbackRunning = true
        scheduleFallbackLoop()
      }
      return
    }

    if (htmlAudio) {
      try {
        await htmlAudio.play()
      } catch {
        switchToFallback()
      }
      return
    }

    const audio = new Audio(BGM_SRC)
    audio.loop = true
    audio.volume = BGM_VOLUME
    audio.addEventListener('error', () => {
      if (!stopped) switchToFallback()
    })
    htmlAudio = audio

    try {
      await audio.play()
    } catch {
      switchToFallback()
    }
  },

  stop() {
    stopped = true
    fallbackRunning = false
    if (htmlAudio) htmlAudio.pause()
    if (fallbackTimer !== null) {
      window.clearTimeout(fallbackTimer)
      fallbackTimer = null
    }
  },
}
