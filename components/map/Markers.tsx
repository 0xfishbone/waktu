'use client'

import { useRef, useState } from 'react'
import { useFrame, ThreeEvent } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { useMapStore } from '@/stores/mapStore'
import placesData from '@/data/places.json'
import type { Place } from '@/data/types'

const places = placesData as Place[]

// Category colors based on design system
const categoryColors: Record<string, string> = {
  'gallery': '#C4502A', // terracotta
  'museum': '#4A5568', // faded-indigo
  'cultural-center': '#D4A03E', // ochre
  'studio': '#2D1F14', // deep-brown
}

interface MarkerProps {
  place: Place
}

function Marker({ place }: MarkerProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const { setHoveredPlace, setSelectedPlace } = useMapStore()

  // Convert lat/lng to world coordinates (simplified projection)
  // This is a very basic conversion - in production you'd use proper projection
  const x = (place.coordinates.lng + 17.46) * 200 // offset and scale
  const z = -(place.coordinates.lat - 14.69) * 200 // offset and scale
  const y = 0.5

  useFrame((state) => {
    if (meshRef.current && hovered) {
      // Gentle bobbing animation on hover
      meshRef.current.position.y = y + Math.sin(state.clock.elapsedTime * 2) * 0.3
    }
  })

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setHovered(true)
    setHoveredPlace(place)
    document.body.style.cursor = 'pointer'
  }

  const handlePointerOut = () => {
    setHovered(false)
    setHoveredPlace(null)
    document.body.style.cursor = 'auto'
  }

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    setSelectedPlace(place)
  }

  const color = categoryColors[place.category] || '#C4502A'

  return (
    <group position={[x, y, z]}>
      {/* Marker sphere */}
      <mesh
        ref={meshRef}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
        castShadow
      >
        <sphereGeometry args={[hovered ? 0.8 : 0.6, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.5 : 0.2}
          roughness={0.3}
          metalness={0.6}
        />
      </mesh>

      {/* Hover tooltip */}
      {hovered && (
        <Html
          position={[0, 2, 0]}
          center
          distanceFactor={10}
          style={{
            pointerEvents: 'none',
          }}
        >
          <div className="bg-deep-brown/90 backdrop-blur-sm px-4 py-2 rounded-md">
            <p className="font-display text-cream text-lg tracking-wide whitespace-nowrap">
              {place.name}
            </p>
            <p className="font-body text-sand text-xs mt-1 capitalize">
              {place.category.replace('-', ' ')}
            </p>
          </div>
        </Html>
      )}
    </group>
  )
}

export default function Markers() {
  const { filterCategory } = useMapStore()

  const filteredPlaces = filterCategory
    ? places.filter((place) => place.category === filterCategory)
    : places

  return (
    <group>
      {filteredPlaces.map((place) => (
        <Marker key={place.id} place={place} />
      ))}
    </group>
  )
}
