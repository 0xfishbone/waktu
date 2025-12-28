'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Terrain() {
  const meshRef = useRef<THREE.Mesh>(null)

  // Optional: subtle animation
  useFrame((state) => {
    if (meshRef.current) {
      // Very subtle breathing effect
      const scale = 1 + Math.sin(state.clock.elapsedTime * 0.2) * 0.002
      meshRef.current.scale.setScalar(scale)
    }
  })

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.5, 0]}
      receiveShadow
    >
      {/* Large plane representing Dakar terrain */}
      <planeGeometry args={[200, 200, 64, 64]} />

      {/* Material with hand-drawn aesthetic colors */}
      <meshStandardMaterial
        color="#F5F1E8" // cream
        roughness={0.9}
        metalness={0.1}
      />
    </mesh>
  )
}
