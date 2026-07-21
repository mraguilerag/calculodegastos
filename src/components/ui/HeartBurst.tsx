import { useCallback, useMemo, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'

interface BurstInstance {
  id: number
  x: number
  y: number
  particles: Array<{ dx: number; dy: number; delay: number; glyph: string }>
}

const GLYPHS = ['💗', '💕', '✨']

export function useHeartBurst() {
  const [bursts, setBursts] = useState<BurstInstance[]>([])
  const counter = useRef(0)

  const burst = useCallback((el: HTMLElement | null) => {
    if (!el) return
    const rect = el.getBoundingClientRect()
    const id = counter.current++
    const particles = Array.from({ length: 6 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 6 + Math.random() * 0.5
      const dist = 36 + Math.random() * 28
      return {
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist - 18,
        delay: Math.random() * 80,
        glyph: GLYPHS[i % GLYPHS.length],
      }
    })
    setBursts((prev) => [...prev, { id, x: rect.left + rect.width / 2, y: rect.top, particles }])
    window.setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.id !== id))
    }, 950)
  }, [])

  const portal = useMemo(
    () =>
      createPortal(
        <div className="pointer-events-none fixed inset-0 z-[80]" aria-hidden>
          {bursts.map((b) => (
            <div key={b.id} style={{ position: 'absolute', left: b.x, top: b.y }}>
              {b.particles.map((p, i) => (
                <span
                  key={i}
                  className="heart-burst-particle"
                  style={
                    {
                      '--dx': `${p.dx}px`,
                      '--dy': `${p.dy}px`,
                      animationDelay: `${p.delay}ms`,
                    } as CSSProperties
                  }
                >
                  {p.glyph}
                </span>
              ))}
            </div>
          ))}
        </div>,
        document.body
      ),
    [bursts]
  )

  return { burst, portal }
}
