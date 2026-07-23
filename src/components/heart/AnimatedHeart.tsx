import { useEffect, useId, useRef, useState } from 'react'
import { useAppStore } from '../../store/useAppStore'

const HEART_PATH =
  'M23.6 0c-3.4 0-6.3 2-7.6 4.9C14.7 2 11.8 0 8.4 0 3.8 0 0 3.8 0 8.4c0 9.4 9.5 13.7 16 20.6 6.5-6.9 16-11.2 16-20.6C32 3.8 28.2 0 23.6 0z'

/**
 * Corazon del header animado con CSS/SVG en vez de una escena 3D en vivo:
 * mismo efecto visual (latido, balanceo, brillo) a costo casi nulo de CPU/GPU,
 * ya que corre enteramente en el compositor.
 */
export function AnimatedHeart() {
  const reactionTick = useAppStore((s) => s.reactionTick)
  const gradId = useId()
  const shineId = useId()
  const [reacting, setReacting] = useState(false)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (reactionTick === 0) return
    setReacting(true)
    if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => setReacting(false), 700)
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    }
  }, [reactionTick])

  return (
    <div className="flex h-28 w-28 flex-shrink-0 items-center justify-center sm:h-32 sm:w-32" aria-hidden>
      <div className="heart-sway h-[68%] w-[68%]">
        <div className={`heart-beat h-full w-full ${reacting ? 'heart-beat-reacting' : ''}`}>
          <svg
            viewBox="0 0 32 29"
            className="h-full w-full drop-shadow-[0_8px_12px_rgba(216,60,120,0.35)]"
          >
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff9ec8" />
                <stop offset="55%" stopColor="#f26ba8" />
                <stop offset="100%" stopColor="#dd4f8f" />
              </linearGradient>
              <radialGradient id={shineId} cx="32%" cy="26%" r="38%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </radialGradient>
            </defs>
            <path d={HEART_PATH} fill={`url(#${gradId})`} />
            <path d={HEART_PATH} fill={`url(#${shineId})`} />
          </svg>
        </div>
      </div>
    </div>
  )
}
