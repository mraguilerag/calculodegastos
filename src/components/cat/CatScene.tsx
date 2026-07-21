import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { ContactShadows, Sparkles } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { CatModel } from './CatModel'

export function CatScene() {
  return (
    <div className="h-28 w-28 flex-shrink-0 sm:h-32 sm:w-32" aria-hidden>
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.35, 4.1], fov: 28 }}
        gl={{ alpha: true, antialias: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.35} color="#fff0f6" />
          <hemisphereLight args={['#ffe8f3', '#3d2b3a', 0.4]} />
          <directionalLight
            position={[2.2, 3, 2.6]}
            intensity={1.6}
            color="#fff6ec"
            castShadow
            shadow-mapSize={[512, 512]}
          />
          <pointLight position={[-2, 0.6, 1.2]} intensity={0.5} color="#f26ba8" />
          <pointLight position={[-0.6, 1.6, -2.2]} intensity={0.9} color="#f3c766" />

          <CatModel />

          <ContactShadows position={[0, -0.98, 0]} opacity={0.45} scale={3.2} blur={2.4} far={1.4} color="#b83b72" />
          <Sparkles count={14} scale={[2.4, 2, 1.6]} size={2.4} speed={0.25} color="#ffd2e8" opacity={0.6} />
        </Suspense>
        <EffectComposer enableNormalPass={false}>
          <Bloom luminanceThreshold={0.65} luminanceSmoothing={0.25} intensity={0.55} mipmapBlur />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
