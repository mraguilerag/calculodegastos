import { useAppStore } from '../store/useAppStore'

let ctx: AudioContext | null = null

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioCtx) return null
  if (!ctx) ctx = new AudioCtx()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

interface Tone {
  freq: number
  start: number
  duration: number
  type?: OscillatorType
  gain?: number
}

function playTones(tones: Tone[]) {
  if (!useAppStore.getState().settings.soundEnabled) return
  const audioCtx = getContext()
  if (!audioCtx) return

  const now = audioCtx.currentTime
  for (const tone of tones) {
    const osc = audioCtx.createOscillator()
    const gainNode = audioCtx.createGain()
    osc.type = tone.type ?? 'sine'
    osc.frequency.value = tone.freq

    const startAt = now + tone.start
    const peakGain = tone.gain ?? 0.12

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
  click: () => playTones([{ freq: 720, start: 0, duration: 0.09, type: 'sine', gain: 0.08 }]),
  save: () =>
    playTones([
      { freq: 880, start: 0, duration: 0.14, type: 'triangle', gain: 0.11 },
      { freq: 1318.5, start: 0.09, duration: 0.2, type: 'triangle', gain: 0.1 },
    ]),
  delete: () =>
    playTones([
      { freq: 660, start: 0, duration: 0.12, type: 'sine', gain: 0.09 },
      { freq: 440, start: 0.07, duration: 0.16, type: 'sine', gain: 0.08 },
    ]),
  error: () =>
    playTones([
      { freq: 300, start: 0, duration: 0.1, type: 'sine', gain: 0.09 },
      { freq: 260, start: 0.11, duration: 0.14, type: 'sine', gain: 0.09 },
    ]),
  toggle: () => playTones([{ freq: 990, start: 0, duration: 0.07, type: 'sine', gain: 0.07 }]),
}
