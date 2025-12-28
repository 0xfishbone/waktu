'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Water plane component for ocean/Atlantic
 * Positioned below terrain to represent the water around Dakar peninsula
 */
export default function WaterPlane() {
  const meshRef = useRef<THREE.Mesh>(null)

  // Subtle wave animation
  useFrame((state) => {
    if (meshRef.current) {
      // Very gentle up/down movement
      meshRef.current.position.y = -2 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -2, 0]}
      receiveShadow
    >
      {/* Large plane for ocean */}
      <planeGeometry args={[300, 300, 1, 1]} />

      {/* Deep indigo water material */}
      <meshStandardMaterial
        color="#1A2B4A"     // Deep indigo
        roughness={0.3}      // Slightly reflective
        metalness={0.2}      // Subtle metallic sheen
        transparent
        opacity={0.9}        // Slightly transparent
      />
    </mesh>
  )
}
