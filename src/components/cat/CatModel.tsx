import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useAppStore } from '../../store/useAppStore'

const COLORS = {
  body: '#f7b3d1',
  bodyShade: '#f299c2',
  belly: '#fff3f8',
  earInner: '#f2679f',
  nose: '#dd4f8f',
  blush: '#ffb0d6',
  iris: '#a688ea',
  pupil: '#241a33',
  whisker: '#fff8ec',
}

const BASE_EAR_L = -0.42
const BASE_EAR_R = 0.42
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
      body: new THREE.MeshPhysicalMaterial({ color: COLORS.body, roughness: 0.38, clearcoat: 0.55, clearcoatRoughness: 0.3 }),
      bodyShade: new THREE.MeshPhysicalMaterial({ color: COLORS.bodyShade, roughness: 0.4, clearcoat: 0.5, clearcoatRoughness: 0.3 }),
      belly: new THREE.MeshPhysicalMaterial({ color: COLORS.belly, roughness: 0.45, clearcoat: 0.4 }),
      earInner: new THREE.MeshPhysicalMaterial({ color: COLORS.earInner, roughness: 0.5 }),
      nose: new THREE.MeshPhysicalMaterial({ color: COLORS.nose, roughness: 0.35, clearcoat: 0.6 }),
      blush: new THREE.MeshBasicMaterial({ color: COLORS.blush, transparent: true, opacity: 0.55 }),
      eyeWhite: new THREE.MeshPhysicalMaterial({ color: '#fffdf8', roughness: 0.2, clearcoat: 0.8 }),
      iris: new THREE.MeshPhysicalMaterial({ color: COLORS.iris, roughness: 0.15, clearcoat: 0.9 }),
      pupil: new THREE.MeshBasicMaterial({ color: COLORS.pupil }),
      highlight: new THREE.MeshBasicMaterial({ color: '#ffffff' }),
      whisker: new THREE.MeshBasicMaterial({ color: COLORS.whisker, transparent: true, opacity: 0.85 }),
    }),
    []
  )

  const tailCurve = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(-0.16, 0.22, -0.05),
      new THREE.Vector3(-0.36, 0.42, -0.08),
      new THREE.Vector3(-0.5, 0.66, 0.05),
      new THREE.Vector3(-0.4, 0.85, 0.18),
    ])
    return curve
  }, [])

  const tailGeometry = useMemo(() => new THREE.TubeGeometry(tailCurve, 24, 0.075, 8, false), [tailCurve])

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
    const targetScaleY = blinking ? 0.12 : reacting ? 0.6 : 1
    if (eyeLRef.current) eyeLRef.current.scale.y = THREE.MathUtils.lerp(eyeLRef.current.scale.y, targetScaleY, 0.35)
    if (eyeRRef.current) eyeRRef.current.scale.y = THREE.MathUtils.lerp(eyeRRef.current.scale.y, targetScaleY, 0.35)
  })

  return (
    <group ref={rootRef} position={[0, 0, 0]} scale={1.15}>
      {/* Cuerpo */}
      <group position={[0, -0.28, 0]}>
        <mesh material={materials.body} position={[0, 0, 0]} scale={[1, 0.9, 0.86]} castShadow receiveShadow>
          <sphereGeometry args={[0.62, 32, 24]} />
        </mesh>
        {/* Ancas para silueta sentada */}
        <mesh material={materials.bodyShade} position={[-0.34, -0.18, -0.14]} scale={[0.62, 0.6, 0.62]} castShadow>
          <sphereGeometry args={[0.34, 20, 16]} />
        </mesh>
        <mesh material={materials.bodyShade} position={[0.34, -0.18, -0.14]} scale={[0.62, 0.6, 0.62]} castShadow>
          <sphereGeometry args={[0.34, 20, 16]} />
        </mesh>
        {/* Pancita */}
        <mesh material={materials.belly} position={[0, -0.08, 0.42]} scale={[0.72, 0.8, 0.55]}>
          <sphereGeometry args={[0.42, 24, 18]} />
        </mesh>
        {/* Patitas delanteras */}
        <mesh material={materials.belly} position={[-0.2, -0.58, 0.4]} scale={[1, 0.7, 1.15]} castShadow>
          <sphereGeometry args={[0.14, 16, 14]} />
        </mesh>
        <mesh material={materials.belly} position={[0.2, -0.58, 0.4]} scale={[1, 0.7, 1.15]} castShadow>
          <sphereGeometry args={[0.14, 16, 14]} />
        </mesh>

        {/* Cola */}
        <group ref={tailRef} position={[-0.32, -0.1, -0.32]} rotation={[0, 0, BASE_TAIL]}>
          <mesh material={materials.body} geometry={tailGeometry} castShadow />
          <mesh material={materials.body} position={tailCurve.getPoint(1)}>
            <sphereGeometry args={[0.078, 12, 12]} />
          </mesh>
        </group>
      </group>

      {/* Cabeza */}
      <group ref={headRef} position={[0, 0.46, 0.08]}>
        <mesh material={materials.body} castShadow receiveShadow>
          <sphereGeometry args={[0.42, 32, 24]} />
        </mesh>

        {/* Orejas */}
        <group ref={earLRef} position={[-0.28, 0.3, 0.02]} rotation={[-0.1, 0, BASE_EAR_L]}>
          <mesh material={materials.body} scale={[0.72, 1, 0.5]} castShadow>
            <coneGeometry args={[0.17, 0.36, 3]} />
          </mesh>
          <mesh material={materials.earInner} position={[0, -0.03, 0.05]} scale={[0.65, 0.85, 0.6]}>
            <coneGeometry args={[0.17, 0.36, 3]} />
          </mesh>
        </group>
        <group ref={earRRef} position={[0.28, 0.3, 0.02]} rotation={[-0.1, 0, BASE_EAR_R]}>
          <mesh material={materials.body} scale={[0.72, 1, 0.5]} castShadow>
            <coneGeometry args={[0.17, 0.36, 3]} />
          </mesh>
          <mesh material={materials.earInner} position={[0, -0.03, 0.05]} scale={[0.65, 0.85, 0.6]}>
            <coneGeometry args={[0.17, 0.36, 3]} />
          </mesh>
        </group>

        {/* Cachetes / hocico */}
        <mesh material={materials.belly} position={[-0.14, -0.1, 0.34]} scale={[0.9, 0.75, 0.85]}>
          <sphereGeometry args={[0.16, 18, 14]} />
        </mesh>
        <mesh material={materials.belly} position={[0.14, -0.1, 0.34]} scale={[0.9, 0.75, 0.85]}>
          <sphereGeometry args={[0.16, 18, 14]} />
        </mesh>

        {/* Nariz */}
        <mesh material={materials.nose} position={[0, 0.02, 0.44]} rotation={[Math.PI / 1.5, 0, 0]}>
          <coneGeometry args={[0.045, 0.06, 8]} />
        </mesh>

        {/* Mejillas sonrojadas */}
        <mesh material={materials.blush} position={[-0.32, -0.08, 0.26]} rotation={[0, -0.6, 0]}>
          <circleGeometry args={[0.09, 16]} />
        </mesh>
        <mesh material={materials.blush} position={[0.32, -0.08, 0.26]} rotation={[0, 0.6, 0]}>
          <circleGeometry args={[0.09, 16]} />
        </mesh>

        {/* Ojos */}
        <group ref={eyeLRef} position={[-0.16, 0.05, 0.35]}>
          <mesh material={materials.eyeWhite} scale={[1, 1, 0.4]}>
            <sphereGeometry args={[0.08, 16, 12]} />
          </mesh>
          <mesh material={materials.iris} position={[0, 0, 0.045]} scale={[1, 1, 0.4]}>
            <sphereGeometry args={[0.052, 14, 10]} />
          </mesh>
          <mesh material={materials.pupil} position={[0, 0, 0.075]}>
            <boxGeometry args={[0.018, 0.05, 0.01]} />
          </mesh>
          <mesh material={materials.highlight} position={[0.018, 0.02, 0.082]}>
            <sphereGeometry args={[0.012, 8, 8]} />
          </mesh>
        </group>
        <group ref={eyeRRef} position={[0.16, 0.05, 0.35]}>
          <mesh material={materials.eyeWhite} scale={[1, 1, 0.4]}>
            <sphereGeometry args={[0.08, 16, 12]} />
          </mesh>
          <mesh material={materials.iris} position={[0, 0, 0.045]} scale={[1, 1, 0.4]}>
            <sphereGeometry args={[0.052, 14, 10]} />
          </mesh>
          <mesh material={materials.pupil} position={[0, 0, 0.075]}>
            <boxGeometry args={[0.018, 0.05, 0.01]} />
          </mesh>
          <mesh material={materials.highlight} position={[0.018, 0.02, 0.082]}>
            <sphereGeometry args={[0.012, 8, 8]} />
          </mesh>
        </group>

        {/* Bigotes */}
        {[-1, 1].map((side) =>
          [-0.12, 0, 0.12].map((fan, i) => (
            <mesh
              key={`${side}-${i}`}
              material={materials.whisker}
              position={[side * 0.36, -0.02 + fan * 0.15, 0.3]}
              rotation={[0, 0, side * (Math.PI / 2 - fan * 0.5)]}
            >
              <cylinderGeometry args={[0.004, 0.004, 0.32, 6]} />
            </mesh>
          ))
        )}
      </group>
    </group>
  )
}
