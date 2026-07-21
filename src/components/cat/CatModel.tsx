import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useAppStore } from '../../store/useAppStore'

/**
 * Paleta adaptada de la app (rosa/crema/dorado) para un gatito chibi:
 * cabeza grande, ojos enormes y brillantes, orejas puntiagudas.
 */
const COLORS = {
  body: '#f7b3d1',
  bodyShade: '#f299c2',
  belly: '#fff3f8',
  earInner: '#f2679f',
  nose: '#dd4f8f',
  blush: '#ffb0d6',
  iris: '#b98a24',
  pupil: '#3d2b3a',
  whisker: '#fff8ec',
}

const BASE_EAR_L = -0.4
const BASE_EAR_R = 0.4
const BASE_TAIL = 0.95

export function CatModel() {
  const rootRef = useRef<THREE.Group>(null)
  const headRef = useRef<THREE.Group>(null)
  const tailRef = useRef<THREE.Group>(null)
  const earLRef = useRef<THREE.Group>(null)
  const earRRef = useRef<THREE.Group>(null)
  const eyeLRef = useRef<THREE.Group>(null)
  const eyeRRef = useRef<THREE.Group>(null)

  const reactionTick = useAppStore((s) => s.reactionTick)
  const reactUntilRef = useRef(0)
  const reducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  )

  useEffect(() => {
    if (reactionTick > 0) reactUntilRef.current = performance.now() + 750
  }, [reactionTick])

  const materials = useMemo(
    () => ({
      body: new THREE.MeshPhysicalMaterial({ color: COLORS.body, roughness: 0.3, clearcoat: 0.7, clearcoatRoughness: 0.2 }),
      bodyShade: new THREE.MeshPhysicalMaterial({ color: COLORS.bodyShade, roughness: 0.32, clearcoat: 0.65, clearcoatRoughness: 0.22 }),
      belly: new THREE.MeshPhysicalMaterial({ color: COLORS.belly, roughness: 0.4, clearcoat: 0.5 }),
      earInner: new THREE.MeshPhysicalMaterial({ color: COLORS.earInner, roughness: 0.45 }),
      nose: new THREE.MeshPhysicalMaterial({ color: COLORS.nose, roughness: 0.3, clearcoat: 0.65 }),
      blush: new THREE.MeshBasicMaterial({ color: COLORS.blush, transparent: true, opacity: 0.5 }),
      eyeWhite: new THREE.MeshPhysicalMaterial({ color: '#fffdf8', roughness: 0.12, clearcoat: 0.9 }),
      iris: new THREE.MeshPhysicalMaterial({ color: COLORS.iris, roughness: 0.08, clearcoat: 1 }),
      pupil: new THREE.MeshBasicMaterial({ color: COLORS.pupil }),
      highlight: new THREE.MeshBasicMaterial({ color: '#ffffff' }),
      whisker: new THREE.MeshBasicMaterial({ color: COLORS.whisker, transparent: true, opacity: 0.85 }),
    }),
    []
  )

  const tailCurve = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(-0.14, 0.2, -0.05),
      new THREE.Vector3(-0.32, 0.38, -0.08),
      new THREE.Vector3(-0.44, 0.6, 0.05),
      new THREE.Vector3(-0.35, 0.78, 0.18),
    ])
    return curve
  }, [])

  const tailGeometry = useMemo(() => new THREE.TubeGeometry(tailCurve, 24, 0.07, 8, false), [tailCurve])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const reacting = performance.now() < reactUntilRef.current

    if (!reducedMotion) {
      const bob = reacting ? Math.abs(Math.sin(t * 13)) * 0.2 : Math.sin(t * 1.4) * 0.032
      if (rootRef.current) {
        rootRef.current.position.y = bob
        rootRef.current.rotation.y = Math.sin(t * 0.5) * 0.1
      }
      if (headRef.current) {
        headRef.current.rotation.z = Math.sin(t * 0.9) * 0.045
        headRef.current.rotation.x = Math.sin(t * 0.6) * 0.025
      }
      if (tailRef.current) {
        const speed = reacting ? 6 : 1.5
        const amp = reacting ? 0.4 : 0.16
        tailRef.current.rotation.z = BASE_TAIL + Math.sin(t * speed) * amp
      }
      const earWiggle = reacting ? Math.sin(t * 20) * 0.2 : Math.sin(t * 1.1) * 0.035
      if (earLRef.current) earLRef.current.rotation.z = BASE_EAR_L - earWiggle
      if (earRRef.current) earRRef.current.rotation.z = BASE_EAR_R + earWiggle
    }

    const blinkPhase = t % 3.6
    const blinking = blinkPhase < 0.12
    const targetScaleY = blinking ? 0.12 : reacting ? 0.7 : 1
    if (eyeLRef.current) eyeLRef.current.scale.y = THREE.MathUtils.lerp(eyeLRef.current.scale.y, targetScaleY, 0.35)
    if (eyeRRef.current) eyeRRef.current.scale.y = THREE.MathUtils.lerp(eyeRRef.current.scale.y, targetScaleY, 0.35)
  })

  return (
    <group ref={rootRef} position={[0, 0, 0]} scale={1.05}>
      {/* Cuerpo (chico, la cabeza es la protagonista) */}
      <group position={[0, -0.2, 0]}>
        <mesh material={materials.body} position={[0, 0, 0]} scale={[1, 0.84, 0.8]} castShadow receiveShadow>
          <sphereGeometry args={[0.5, 32, 24]} />
        </mesh>
        {/* Ancas para silueta sentada */}
        <mesh material={materials.bodyShade} position={[-0.27, -0.14, -0.12]} scale={[0.58, 0.56, 0.58]} castShadow>
          <sphereGeometry args={[0.3, 20, 16]} />
        </mesh>
        <mesh material={materials.bodyShade} position={[0.27, -0.14, -0.12]} scale={[0.58, 0.56, 0.58]} castShadow>
          <sphereGeometry args={[0.3, 20, 16]} />
        </mesh>
        {/* Pancita */}
        <mesh material={materials.belly} position={[0, -0.04, 0.34]} scale={[0.7, 0.78, 0.5]}>
          <sphereGeometry args={[0.34, 24, 18]} />
        </mesh>
        {/* Patitas delanteras */}
        <mesh material={materials.belly} position={[-0.16, -0.46, 0.32]} scale={[1, 0.7, 1.1]} castShadow>
          <sphereGeometry args={[0.11, 16, 14]} />
        </mesh>
        <mesh material={materials.belly} position={[0.16, -0.46, 0.32]} scale={[1, 0.7, 1.1]} castShadow>
          <sphereGeometry args={[0.11, 16, 14]} />
        </mesh>

        {/* Cola */}
        <group ref={tailRef} position={[-0.26, -0.06, -0.26]} rotation={[0, 0, BASE_TAIL]}>
          <mesh material={materials.body} geometry={tailGeometry} castShadow />
          <mesh material={materials.body} position={tailCurve.getPoint(1)}>
            <sphereGeometry args={[0.072, 12, 12]} />
          </mesh>
        </group>
      </group>

      {/* Cabeza (mas grande que el cuerpo: proporcion chibi) */}
      <group ref={headRef} position={[0, 0.48, 0.1]}>
        <mesh material={materials.body} castShadow receiveShadow>
          <sphereGeometry args={[0.56, 32, 24]} />
        </mesh>

        {/* Orejas */}
        <group ref={earLRef} position={[-0.36, 0.38, 0.02]} rotation={[-0.1, 0, BASE_EAR_L]}>
          <mesh material={materials.body} scale={[0.72, 1, 0.5]} castShadow>
            <coneGeometry args={[0.22, 0.46, 3]} />
          </mesh>
          <mesh material={materials.earInner} position={[0, -0.04, 0.06]} scale={[0.62, 0.82, 0.55]}>
            <coneGeometry args={[0.22, 0.46, 3]} />
          </mesh>
        </group>
        <group ref={earRRef} position={[0.36, 0.38, 0.02]} rotation={[-0.1, 0, BASE_EAR_R]}>
          <mesh material={materials.body} scale={[0.72, 1, 0.5]} castShadow>
            <coneGeometry args={[0.22, 0.46, 3]} />
          </mesh>
          <mesh material={materials.earInner} position={[0, -0.04, 0.06]} scale={[0.62, 0.82, 0.55]}>
            <coneGeometry args={[0.22, 0.46, 3]} />
          </mesh>
        </group>

        {/* Cachetes / hocico */}
        <mesh material={materials.belly} position={[-0.19, -0.14, 0.46]} scale={[0.95, 0.8, 0.85]}>
          <sphereGeometry args={[0.21, 18, 14]} />
        </mesh>
        <mesh material={materials.belly} position={[0.19, -0.14, 0.46]} scale={[0.95, 0.8, 0.85]}>
          <sphereGeometry args={[0.21, 18, 14]} />
        </mesh>

        {/* Nariz */}
        <mesh material={materials.nose} position={[0, 0.02, 0.58]} rotation={[Math.PI / 1.5, 0, 0]}>
          <coneGeometry args={[0.055, 0.075, 8]} />
        </mesh>

        {/* Mejillas sonrojadas */}
        <mesh material={materials.blush} position={[-0.42, -0.11, 0.34]} rotation={[0, -0.6, 0]}>
          <circleGeometry args={[0.12, 16]} />
        </mesh>
        <mesh material={materials.blush} position={[0.42, -0.11, 0.34]} rotation={[0, 0.6, 0]}>
          <circleGeometry args={[0.12, 16]} />
        </mesh>

        {/* Ojos grandes y brillantes */}
        <group ref={eyeLRef} position={[-0.23, 0.06, 0.46]}>
          <mesh material={materials.eyeWhite} scale={[1, 1, 0.5]}>
            <sphereGeometry args={[0.16, 20, 16]} />
          </mesh>
          <mesh material={materials.iris} position={[0, -0.01, 0.075]} scale={[1, 1, 0.45]}>
            <sphereGeometry args={[0.125, 16, 12]} />
          </mesh>
          <mesh material={materials.pupil} position={[0, -0.02, 0.1]} scale={[1, 1, 0.4]}>
            <sphereGeometry args={[0.07, 14, 10]} />
          </mesh>
          <mesh material={materials.highlight} position={[-0.045, 0.05, 0.108]}>
            <sphereGeometry args={[0.036, 8, 8]} />
          </mesh>
          <mesh material={materials.highlight} position={[0.05, -0.045, 0.104]}>
            <sphereGeometry args={[0.016, 8, 8]} />
          </mesh>
        </group>
        <group ref={eyeRRef} position={[0.23, 0.06, 0.46]}>
          <mesh material={materials.eyeWhite} scale={[1, 1, 0.5]}>
            <sphereGeometry args={[0.16, 20, 16]} />
          </mesh>
          <mesh material={materials.iris} position={[0, -0.01, 0.075]} scale={[1, 1, 0.45]}>
            <sphereGeometry args={[0.125, 16, 12]} />
          </mesh>
          <mesh material={materials.pupil} position={[0, -0.02, 0.1]} scale={[1, 1, 0.4]}>
            <sphereGeometry args={[0.07, 14, 10]} />
          </mesh>
          <mesh material={materials.highlight} position={[-0.045, 0.05, 0.108]}>
            <sphereGeometry args={[0.036, 8, 8]} />
          </mesh>
          <mesh material={materials.highlight} position={[0.05, -0.045, 0.104]}>
            <sphereGeometry args={[0.016, 8, 8]} />
          </mesh>
        </group>

        {/* Bigotes */}
        {[-1, 1].map((side) =>
          [-0.12, 0, 0.12].map((fan, i) => (
            <mesh
              key={`${side}-${i}`}
              material={materials.whisker}
              position={[side * 0.48, -0.06 + fan * 0.15, 0.4]}
              rotation={[0, 0, side * (Math.PI / 2 - fan * 0.5)]}
            >
              <cylinderGeometry args={[0.004, 0.004, 0.34, 6]} />
            </mesh>
          ))
        )}
      </group>
    </group>
  )
}
