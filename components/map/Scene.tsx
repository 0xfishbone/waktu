'use client'

import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera, Environment } from '@react-three/drei'
import { Suspense } from 'react'
import * as THREE from 'three'
import Terrain from './Terrain'
import Markers from './Markers'
import Controls from './Controls'
import WaterPlane from './WaterPlane'

export default function Scene() {
  return (
    <div className="w-full h-screen">
      <Canvas
        style={{ background: '#E8DFD0' }} // Sand color for sky
        gl={{
          antialias: true,
          alpha: false,
        }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
        onCreated={({ scene, gl }) => {
          gl.setClearColor('#E8DFD0', 1)

          // Add fog for depth and atmosphere
          scene.fog = new THREE.Fog('#E8DFD0', 50, 200)
        }}
      >
        {/* Camera - adjusted for Dakar view */}
        <PerspectiveCamera
          makeDefault
          position={[0, 80, 100]}
          fov={55}
          near={0.1}
          far={1000}
        />

        {/* Lighting - warmer tones for Dakar */}
        <ambientLight intensity={0.7} color="#FFF8E7" />
        <directionalLight
          position={[20, 60, 20]}
          intensity={0.6}
          color="#FFF5E1"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-100}
          shadow-camera-right={100}
          shadow-camera-top={100}
          shadow-camera-bottom={-100}
        />

        {/* Hemisphere light for warm/cool balance */}
        <hemisphereLight
          args={['#FFF8E7', '#1A2B4A', 0.4]}
          position={[0, 50, 0]}
        />

        {/* Environment */}
        <Environment preset="sunset" />

        {/* Scene Content */}
        <Suspense fallback={null}>
          <WaterPlane />
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
