import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useAppStore } from '../../store/useAppStore'

const COLOR = '#f26ba8'
const COLOR_SHADE = '#dd4f8f'

function createHeartShape(): THREE.Shape {
  const shape = new THREE.Shape()
  const x = 0
  const y = 0
  shape.moveTo(x + 0.25, y + 0.25)
  shape.bezierCurveTo(x + 0.25, y + 0.25, x + 0.2, y, x, y)
  shape.bezierCurveTo(x - 0.3, y, x - 0.3, y + 0.35, x - 0.3, y + 0.35)
  shape.bezierCurveTo(x - 0.3, y + 0.55, x - 0.1, y + 0.77, x + 0.25, y + 0.95)
  shape.bezierCurveTo(x + 0.6, y + 0.77, x + 0.8, y + 0.55, x + 0.8, y + 0.35)
  shape.bezierCurveTo(x + 0.8, y + 0.35, x + 0.8, y, x + 0.5, y)
  shape.bezierCurveTo(x + 0.35, y, x + 0.25, y + 0.25, x + 0.25, y + 0.25)
  return shape
}

/** Pulso "lub-dub" de un latido real: dos golpes cortos y una pausa, en loop. */
function heartbeatBump(t: number): number {
  const cycle = 1.15
  const phase = t % cycle
  if (phase < 0.14) return Math.sin((phase / 0.14) * Math.PI) * 0.13
  if (phase < 0.3) return 0
  if (phase < 0.44) return Math.sin(((phase - 0.3) / 0.14) * Math.PI) * 0.08
  return 0
}

export function HeartModel() {
  const rootRef = useRef<THREE.Group>(null)
  const reactionTick = useAppStore((s) => s.reactionTick)
  const reactUntilRef = useRef(0)
  const reducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  )

  useEffect(() => {
    if (reactionTick > 0) reactUntilRef.current = performance.now() + 700
  }, [reactionTick])

  const geometry = useMemo(() => {
    const shape = createHeartShape()
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.4,
      bevelEnabled: true,
      bevelThickness: 0.12,
      bevelSize: 0.08,
      bevelSegments: 8,
      curveSegments: 24,
    })
    geo.center()
    // La forma clasica de corazon en three.js queda con las lobulas hacia abajo
    // en el espacio Y-up de Three.js; se voltea 180 grados para que el
    // corazon quede con la punta abajo y las lobulas arriba.
    geo.rotateZ(Math.PI)
    return geo
  }, [])

  const material = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: COLOR, roughness: 0.28, clearcoat: 0.75, clearcoatRoughness: 0.18 }),
    []
  )
  const shadeMaterial = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: COLOR_SHADE, roughness: 0.32, clearcoat: 0.6 }),
    []
  )

  useFrame((state) => {
    if (reducedMotion || !rootRef.current) return
    const t = state.clock.elapsedTime
    const reacting = performance.now() < reactUntilRef.current

    const bump = reacting ? heartbeatBump(t * 2.2) * 1.8 : heartbeatBump(t)
    const scale = 1 + bump
    rootRef.current.scale.set(scale, scale, scale)
    rootRef.current.rotation.y = Math.sin(t * 0.5) * 0.22
    rootRef.current.rotation.x = -0.1 + Math.sin(t * 0.4) * 0.04
  })

  return (
    <group ref={rootRef} scale={1.35} position={[0, -0.05, 0]}>
      <mesh geometry={geometry} material={material} castShadow receiveShadow />
      {/* leve sombreado interior para dar volumen, no compite con el material principal */}
      <mesh geometry={geometry} material={shadeMaterial} scale={0.96} position={[0, 0, -0.05]} />
    </group>
  )
}
