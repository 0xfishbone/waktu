'use client'

import { useState, useEffect } from 'react'
import * as THREE from 'three'
import { generateTerrainMesh } from '@/lib/terrain'
import { generateMapTexture } from '@/lib/texture'

/**
 * Terrain component with real Dakar elevation data and Aquarelle texture
 * Fetches MapTiler tiles on mount and creates displaced 3D mesh
 */
export default function Terrain() {
  const [geometry, setGeometry] = useState<THREE.PlaneGeometry | null>(null)
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    let timeoutId: NodeJS.Timeout

    async function loadTerrain() {
      try {
        console.log('🗺️  Loading Dakar terrain and texture...')

        // Add 30 second timeout
        const timeoutPromise = new Promise((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error('Terrain loading timed out after 30 seconds'))
          }, 30000)
        })

        // Fetch terrain and texture in parallel with timeout
        const dataPromise = Promise.all([
          generateTerrainMesh(14, 128, 100, 5), // zoom, resolution, size, exaggeration
          generateMapTexture(14) // zoom level
        ])

        const [terrainData, mapTexture] = await Promise.race([
          dataPromise,
          timeoutPromise
        ]) as [any, any]

        clearTimeout(timeoutId)

        if (!mounted) return

        setGeometry(terrainData.geometry)
        setTexture(mapTexture)
        setLoading(false)

        console.log('✅ Terrain loaded successfully!')
      } catch (err) {
        console.error('❌ Failed to load terrain:', err)
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load terrain')
          setLoading(false)
        }
      }
    }

    loadTerrain()

    return () => {
      mounted = false
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [])

  // Show error state with fallback terrain
  if (error) {
    console.warn('Rendering fallback terrain due to error:', error)
    return (
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100, 10, 10]} />
        <meshStandardMaterial color="#F5F1E8" wireframe={false} />
      </mesh>
    )
  }

  // Show placeholder while loading
  if (loading || !geometry || !texture) {
    return (
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[100, 100, 1, 1]} />
        <meshStandardMaterial color="#F5F1E8" />
      </mesh>
    )
  }

  return (
    <mesh
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      receiveShadow
      castShadow
    >
      <meshStandardMaterial
        map={texture}
        roughness={0.9}
        metalness={0.1}
      />
    </mesh>
  )
}
