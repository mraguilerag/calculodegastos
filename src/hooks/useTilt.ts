import { useMotionValue, useSpring, useTransform } from 'framer-motion'
import type { PointerEvent } from 'react'

interface UseTiltOptions {
  max?: number
  scale?: number
}

export function useTilt({ max = 8, scale = 1.015 }: UseTiltOptions = {}) {
  const x = useMotionValue(0.5)
  const y = useMotionValue(0.5)

  const springConfig = { stiffness: 220, damping: 20, mass: 0.4 }
  const rotateX = useSpring(useTransform(y, [0, 1], [max, -max]), springConfig)
  const rotateY = useSpring(useTransform(x, [0, 1], [-max, max]), springConfig)
  const scaleSpring = useSpring(1, springConfig)

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    x.set((event.clientX - rect.left) / rect.width)
    y.set((event.clientY - rect.top) / rect.height)
  }

  function handlePointerEnter() {
    scaleSpring.set(scale)
  }

  function handlePointerLeave() {
    x.set(0.5)
    y.set(0.5)
    scaleSpring.set(1)
  }

  return {
    style: { rotateX, rotateY, scale: scaleSpring, transformPerspective: 800 },
    handlers: {
      onPointerMove: handlePointerMove,
      onPointerEnter: handlePointerEnter,
      onPointerLeave: handlePointerLeave,
    },
  }
}
