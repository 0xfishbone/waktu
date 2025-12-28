'use client'

import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera, Environment } from '@react-three/drei'
import { Suspense } from 'react'
import Terrain from './Terrain'
import Markers from './Markers'
import Controls from './Controls'

export default function Scene() {
  return (
    <div className="w-full h-screen">
      <Canvas
        style={{ background: '#F5F1E8' }}
        gl={{
          antialias: true,
          alpha: false,
        }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
        onCreated={({ gl }) => {
          gl.setClearColor('#F5F1E8', 1)
        }}
      >
        {/* Camera */}
        <PerspectiveCamera
          makeDefault
          position={[0, 100, 120]}
          fov={50}
          near={0.1}
          far={1000}
        />

        {/* Lighting */}
        <ambientLight intensity={0.8} />
        <directionalLight
          position={[10, 50, 10]}
          intensity={0.5}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        {/* Environment */}
        <Environment preset="sunset" />

        {/* Scene Content */}
        <Suspense fallback={null}>
          <Terrain />
          <Markers />
          <Controls />
        </Suspense>

        {/* Grid Helper (dev only) */}
        {process.env.NODE_ENV === 'development' && (
          <gridHelper args={[200, 20, '#4A5568', '#E8DFD0']} />
        )}
      </Canvas>
    </div>
  )
}
