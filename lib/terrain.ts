/**
 * MapTiler terrain-rgb elevation data fetching and terrain mesh generation
 * Creates 3D displaced geometry based on real Dakar elevation
 */

import * as THREE from 'three'
import { getTilesForBounds, DAKAR_BOUNDS, type Bounds } from './coordinates'

const MAPTILER_API_KEY = process.env.NEXT_PUBLIC_MAPTILER_API_KEY

/**
 * Fetch a MapTiler terrain-rgb tile
 * Returns raw image data where RGB values encode elevation
 */
async function fetchTerrainTile(
  x: number,
  y: number,
  z: number
): Promise<HTMLImageElement> {
  const url = `https://api.maptiler.com/tiles/terrain-rgb/${z}/${x}/${y}.png?key=${MAPTILER_API_KEY}`

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

/**
 * Decode terrain-rgb elevation from RGB values
 * Formula: elevation = -10000 + (R * 256 * 256 + G * 256 + B) * 0.1
 *
 * @param r - Red channel (0-255)
 * @param g - Green channel (0-255)
 * @param b - Blue channel (0-255)
 * @returns elevation in meters
 */
function decodeElevation(r: number, g: number, b: number): number {
  return -10000 + ((r * 256 * 256 + g * 256 + b) * 0.1)
}

/**
 * Sample elevation data from stitched terrain tiles
 * Returns a 2D array of elevation values
 */
async function getElevationData(
  bounds: Bounds,
  zoom: number,
  resolution: number = 128
): Promise<number[][]> {
  const tiles = getTilesForBounds(bounds, zoom)

  // Create canvas to stitch tiles
  const xTiles = new Set(tiles.map((t) => t.x)).size
  const yTiles = new Set(tiles.map((t) => t.y)).size
  const tileSize = 512

  const canvas = document.createElement('canvas')
  canvas.width = xTiles * tileSize
  canvas.height = yTiles * tileSize
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Failed to get canvas 2D context')
  }

  // Get min X and Y for positioning
  const minX = Math.min(...tiles.map((t) => t.x))
  const minY = Math.min(...tiles.map((t) => t.y))

  console.log(`Fetching terrain data: ${tiles.length} tiles`)

  // Fetch and draw all terrain tiles
  await Promise.all(
    tiles.map(async (tile) => {
      try {
        const img = await fetchTerrainTile(tile.x, tile.y, tile.z)
        const canvasX = (tile.x - minX) * tileSize
        const canvasY = (tile.y - minY) * tileSize
        ctx.drawImage(img, canvasX, canvasY, tileSize, tileSize)
      } catch (error) {
        console.error(`Failed to fetch terrain tile ${tile.x},${tile.y}:`, error)
      }
    })
  )

  // Sample elevation data at resolution intervals
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  const elevationGrid: number[][] = []
  const stepX = canvas.width / resolution
  const stepY = canvas.height / resolution

  for (let y = 0; y < resolution; y++) {
    const row: number[] = []
    for (let x = 0; x < resolution; x++) {
      const pixelX = Math.floor(x * stepX)
      const pixelY = Math.floor(y * stepY)
      const index = (pixelY * canvas.width + pixelX) * 4

      const r = data[index]
      const g = data[index + 1]
      const b = data[index + 2]

      const elevation = decodeElevation(r, g, b)
      row.push(elevation)
    }
    elevationGrid.push(row)
  }

  return elevationGrid
}

/**
 * Create a Three.js PlaneGeometry with displaced vertices based on elevation data
 *
 * @param elevationData - 2D array of elevation values
 * @param size - Size of the terrain in Three.js units (default: 100)
 * @param exaggeration - Elevation exaggeration factor (default: 5)
 * @returns THREE.PlaneGeometry with displaced vertices
 */
function createTerrainGeometry(
  elevationData: number[][],
  size: number = 100,
  exaggeration: number = 5
): THREE.PlaneGeometry {
  const resolution = elevationData.length
  const geometry = new THREE.PlaneGeometry(
    size,
    size,
    resolution - 1,
    resolution - 1
  )

  // Get position attribute
  const positions = geometry.attributes.position

  // Find min/max elevation for normalization
  let minElevation = Infinity
  let maxElevation = -Infinity

  for (const row of elevationData) {
    for (const elevation of row) {
      if (elevation < minElevation) minElevation = elevation
      if (elevation > maxElevation) maxElevation = elevation
    }
  }

  console.log(`Elevation range: ${minElevation.toFixed(1)}m to ${maxElevation.toFixed(1)}m`)

  const elevationRange = maxElevation - minElevation

  // Displace vertices based on elevation
  for (let y = 0; y < resolution; y++) {
    for (let x = 0; x < resolution; x++) {
      const index = y * resolution + x
      const elevation = elevationData[y][x]

      // Normalize elevation and apply exaggeration
      const normalizedElevation = (elevation - minElevation) / elevationRange
      const displacedZ = normalizedElevation * exaggeration

      // Set vertex Z position (height)
      positions.setZ(index, displacedZ)
    }
  }

  // Recompute normals for proper lighting
  geometry.computeVertexNormals()

  return geometry
}

/**
 * Generate a complete terrain mesh with elevation and texture
 *
 * @param zoom - Tile zoom level (13 = fast, 14 = balanced)
 * @param resolution - Terrain mesh resolution (64 = low, 128 = medium, 256 = high)
 * @param size - Size in Three.js units
 * @param exaggeration - Elevation exaggeration factor
 * @returns Object with geometry and elevationData for marker placement
 */
export async function generateTerrainMesh(
  zoom: number = 14,
  resolution: number = 128,
  size: number = 100,
  exaggeration: number = 5
): Promise<{
  geometry: THREE.PlaneGeometry
  elevationData: number[][]
  size: number
}> {
  console.log('Generating terrain mesh...')
  const startTime = performance.now()

  const elevationData = await getElevationData(DAKAR_BOUNDS, zoom, resolution)
  const geometry = createTerrainGeometry(elevationData, size, exaggeration)

  const elapsed = performance.now() - startTime
  console.log(`Terrain mesh generated in ${elapsed.toFixed(0)}ms`)
  console.log(`Resolution: ${resolution}x${resolution} vertices`)

  return {
    geometry,
    elevationData,
    size,
  }
}

/**
 * Sample elevation at a specific world position
 * Used to place markers at correct height on terrain
 *
 * @param x - World X coordinate
 * @param z - World Z coordinate
 * @param elevationData - 2D elevation array
 * @param terrainSize - Size of terrain in Three.js units
 * @returns Elevation at that position (Y coordinate)
 */
export function sampleElevation(
  x: number,
  z: number,
  elevationData: number[][],
  terrainSize: number = 100
): number {
  const resolution = elevationData.length

  // Convert world coordinates to grid indices
  const gridX = ((x / terrainSize) + 0.5) * (resolution - 1)
  const gridZ = (0.5 - (z / terrainSize)) * (resolution - 1)

  // Clamp to grid bounds
  const clampedX = Math.max(0, Math.min(resolution - 1, Math.floor(gridX)))
  const clampedZ = Math.max(0, Math.min(resolution - 1, Math.floor(gridZ)))

  // Return normalized elevation (already scaled by exaggeration in geometry)
  const elevation = elevationData[clampedZ][clampedX]
  return elevation
}
