import { useEffect, useMemo, type CSSProperties } from 'react'
import { useMotionValue, useSpring, useTransform, motion, type MotionValue } from 'framer-motion'

const BUILDING_LAYERS = [
  {
    depth: 6,
    color: 'fill-lavender-300/70 dark:fill-night-600/70',
    rects: [
      [0, 210, 60, 90],
      [70, 180, 50, 120],
      [135, 225, 45, 75],
      [190, 165, 65, 135],
      [265, 200, 55, 100],
      [330, 150, 70, 150],
      [410, 215, 50, 85],
      [470, 190, 60, 110],
    ],
  },
  {
    depth: 14,
    color: 'fill-lavender-400/80 dark:fill-night-700/85',
    rects: [
      [-10, 240, 55, 60],
      [50, 195, 65, 105],
      [125, 250, 50, 50],
      [185, 205, 75, 95],
      [270, 235, 55, 65],
      [335, 175, 60, 125],
      [405, 245, 50, 55],
      [465, 215, 65, 85],
    ],
  },
  {
    depth: 26,
    color: 'fill-ink-900/80 dark:fill-night-900',
    rects: [
      [-20, 270, 70, 30],
      [60, 250, 60, 50],
      [140, 275, 55, 25],
      [210, 240, 80, 60],
      [305, 265, 60, 35],
      [380, 230, 70, 70],
      [460, 260, 60, 40],
    ],
  },
] as const

function useParallax() {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 40, damping: 18 })
  const springY = useSpring(y, { stiffness: 40, damping: 18 })

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    function onMove(e: PointerEvent) {
      const nx = e.clientX / window.innerWidth - 0.5
      const ny = e.clientY / window.innerHeight - 0.5
      x.set(nx)
      y.set(ny)
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [x, y])

  return { springX, springY }
}

function usePetals(count: number) {
  return useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.round(Math.random() * 100),
        duration: 14 + Math.random() * 10,
        delay: -(Math.random() * 20),
        size: 6 + Math.random() * 6,
        drift: (Math.random() - 0.5) * 80,
      })),
    [count]
  )
}

function useSparkles(count: number) {
  return useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.round(Math.random() * 100),
        top: Math.round(Math.random() * 90),
        size: 8 + Math.random() * 10,
        duration: 2.4 + Math.random() * 2.6,
        delay: -(Math.random() * 4),
        gold: i % 2 === 0,
      })),
    [count]
  )
}

function useHearts(count: number) {
  return useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.round(Math.random() * 100),
        duration: 16 + Math.random() * 12,
        delay: -(Math.random() * 22),
        size: 10 + Math.random() * 10,
        drift: (Math.random() - 0.5) * 60,
        lavender: i % 2 === 0,
      })),
    [count]
  )
}

interface GlyphProps {
  className?: string
  style?: CSSProperties
}

function SparkleGlyph({ className, style }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
      <path d="M12 0c0.6 5.6 1.9 8.6 5 10.6 3 2 6.4 2.9 7 3.4-0.6 0.5-4 1.4-7 3.4-3.1 2-4.4 5-5 10.6-0.6-5.6-1.9-8.6-5-10.6C3.9 15.4 0.6 14.5 0 14c0.6-0.5 4-1.4 7-3.4 3.1-2 4.4-5 5-10.6z" />
    </svg>
  )
}

function HeartGlyph({ className, style }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
      <path d="M12 21s-7.5-4.8-10.3-9.6C0 8.3 1.2 4.6 4.6 3.4 7.1 2.5 9.7 3.5 12 6c2.3-2.5 4.9-3.5 7.4-2.6 3.4 1.2 4.6 4.9 2.9 8-2.8 4.8-10.3 9.6-10.3 9.6z" />
    </svg>
  )
}

function BlossomGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className}>
      {[0, 72, 144, 216, 288].map((angle) => (
        <ellipse
          key={angle}
          cx="20"
          cy="11"
          rx="6.5"
          ry="9"
          fill="currentColor"
          transform={`rotate(${angle} 20 20)`}
        />
      ))}
      <circle cx="20" cy="20" r="4" className="fill-gold-400" />
    </svg>
  )
}

interface SkylineLayerProps {
  layer: (typeof BUILDING_LAYERS)[number]
  springX: MotionValue<number>
  springY: MotionValue<number>
}

function SkylineLayer({ layer, springX, springY }: SkylineLayerProps) {
  const x = useTransform(springX, (v) => v * -layer.depth)
  const y = useTransform(springY, (v) => v * -layer.depth * 0.4)

  return (
    <motion.g style={{ x, y }}>
      {layer.rects.map(([rx, ry, rw, rh], i) => (
        <g key={i}>
          <rect x={rx} y={ry} width={rw} height={rh} className={layer.color} rx={2} />
          {Array.from({ length: Math.max(2, Math.floor(rh / 22)) }).map((_, wi) => (
            <rect
              key={wi}
              x={rx + 6 + (wi % 2) * (rw / 2)}
              y={ry + 10 + Math.floor(wi / 2) * 20}
              width={rw / 2 - 12}
              height={8}
              rx={1.5}
              className={
                (rx + wi * 7) % 3 === 0
                  ? 'fill-gold-300/90'
                  : (rx + wi * 7) % 3 === 1
                    ? 'fill-pink-200/80'
                    : 'fill-transparent'
              }
            />
          ))}
        </g>
      ))}
    </motion.g>
  )
}

export function AppBackground() {
  const { springX, springY } = useParallax()
  const petals = usePetals(10)
  const sparkles = useSparkles(16)
  const hearts = useHearts(7)
  const moonX = useTransform(springX, (v) => v * -18)
  const moonY = useTransform(springY, (v) => v * -12)

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      {/* Cielo de atardecer/noche */}
      <div className="absolute inset-0 bg-gradient-to-b from-lavender-200 via-pink-200 to-gold-200 dark:from-night-950 dark:via-night-900 dark:to-night-800" />

      {/* Luna con resplandor */}
      <motion.div
        style={{ x: moonX, y: moonY }}
        className="absolute right-[12%] top-[12%] h-24 w-24 rounded-full bg-cream-50 shadow-[0_0_70px_20px_rgba(255,246,232,0.55)] dark:bg-gold-200 dark:shadow-[0_0_90px_24px_rgba(243,199,102,0.35)]"
      />

      {/* Estrellas (solo modo oscuro) */}
      <div className="absolute inset-0 hidden dark:block">
        {Array.from({ length: 40 }).map((_, i) => (
          <span
            key={i}
            className="absolute h-[2px] w-[2px] rounded-full bg-white/70"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 60}%`,
              opacity: 0.3 + ((i * 13) % 70) / 100,
            }}
          />
        ))}
      </div>

      {/* Skyline en capas con parallax */}
      <svg
        viewBox="0 0 500 320"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-x-0 bottom-0 h-[55%] w-full"
      >
        {BUILDING_LAYERS.map((layer, layerIndex) => (
          <SkylineLayer key={layerIndex} layer={layer} springX={springX} springY={springY} />
        ))}
      </svg>

      {/* Petalos de sakura cayendo */}
      {petals.map((p) => (
        <span
          key={p.id}
          className="sakura-petal absolute top-[-5%] rounded-[60%_40%_60%_40%] bg-pink-300/70 dark:bg-pink-200/50"
          style={
            {
              left: `${p.left}%`,
              width: p.size,
              height: p.size * 0.8,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              '--petal-drift': `${p.drift}px`,
            } as CSSProperties
          }
        />
      ))}

      {/* Destellos titilando */}
      {sparkles.map((s) => (
        <SparkleGlyph
          key={s.id}
          className={
            'twinkle-sparkle absolute ' + (s.gold ? 'text-gold-400/80 dark:text-gold-300/70' : 'text-pink-300/80 dark:text-pink-200/60')
          }
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}

      {/* Corazones flotando hacia arriba */}
      {hearts.map((h) => (
        <HeartGlyph
          key={h.id}
          className={
            'floating-heart absolute bottom-0 ' + (h.lavender ? 'text-lavender-300/60 dark:text-lavender-300/40' : 'text-pink-300/60 dark:text-pink-200/40')
          }
          style={
            {
              left: `${h.left}%`,
              width: h.size,
              height: h.size,
              animationDuration: `${h.duration}s`,
              animationDelay: `${h.delay}s`,
              '--heart-drift': `${h.drift}px`,
            } as CSSProperties
          }
        />
      ))}

      {/* Florecitas decorativas cerca del skyline */}
      <BlossomGlyph className="blossom-sway absolute bottom-[8%] left-[6%] h-10 w-10 text-pink-300/50 dark:text-pink-200/30" />
      <BlossomGlyph className="blossom-sway absolute bottom-[14%] right-[9%] h-7 w-7 text-lavender-300/50 dark:text-lavender-300/30" />

      <div className="grain-overlay" />
    </div>
  )
}
