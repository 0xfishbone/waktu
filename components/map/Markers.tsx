'use client'

import { useRef, useState } from 'react'
import { useFrame, useThree, ThreeEvent } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { useMapStore } from '@/stores/mapStore'
import { lngLatToWorld } from '@/lib/coordinates'
import { flyToMarker } from '@/lib/animations'
import placesData from '@/data/places.json'
import type { Place } from '@/data/types'

const places = placesData as Place[]

// Category colors from design system
const categoryColors: Record<string, string> = {
  'gallery': '#C4502A',         // Terracotta
  'museum': '#4A5568',          // Faded indigo
  'cultural-center': '#D4A03E', // Ochre
  'studio': '#2D1F14',          // Deep brown
  'landmark': '#2B4F6C',        // Atlantic blue
}

interface MarkerProps {
  place: Place
}

function Marker({ place }: MarkerProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const { setHoveredPlace, setSelectedPlace } = useMapStore()
  const { camera } = useThree()

  // Convert lng/lat to world coordinates using proper projection
  const [lng, lat] = place.coordinates
  const { x, z } = lngLatToWorld(lng, lat)
  const y = 2 // Fixed height above terrain for now (TODO: sample terrain elevation)

  // Bobbing animation on hover
  useFrame((state) => {
    if (meshRef.current && hovered) {
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

    // Fly camera to marker with smooth animation
    const markerPosition = new THREE.Vector3(x, y, z)
    flyToMarker(camera, markerPosition, {
      distance: 25,    // How far from marker
      angleY: 50,      // View from slightly above
      angleXZ: 35,     // Viewing angle around marker
      duration: 1.8,   // Animation duration in seconds
      ease: 'power2.inOut',
      onComplete: () => {
        console.log('Flew to:', place.name)
      }
    })
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
        <sphereGeometry args={[hovered ? 1.2 : 0.8, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.6 : 0.3}
          roughness={0.3}
          metalness={0.6}
        />
      </mesh>

      {/* Hover tooltip */}
      {hovered && (
        <Html
          position={[0, 2.5, 0]}
          center
          distanceFactor={10}
          style={{ pointerEvents: 'none' }}
        >
          <div className="bg-deep-brown/95 backdrop-blur-sm px-4 py-2 rounded-md shadow-xl">
            <p className="font-display text-cream text-lg tracking-wide whitespace-nowrap">
              {place.name}
            </p>
            <p className="font-body text-sand text-xs mt-1 capitalize">
              {place.category.replace('-', ' ')}
            </p>
            <p className="font-body text-sand/70 text-xs mt-0.5">
              {place.neighborhood}
            </p>
          </div>
        </Html>
      )}
    </group>
  )
}

export default function Markers() {
  const { filterCategory } = useMapStore()

  // Filter places by category if filter is active
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
