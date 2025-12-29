/**
 * MapTiler texture fetching and stitching for Dakar map
 * Fetches Aquarelle (watercolor) style tiles and combines into single texture
 */

import * as THREE from 'three'
import { getTilesForBounds, DAKAR_BOUNDS, type Bounds } from './coordinates'

const MAPTILER_API_KEY = process.env.NEXT_PUBLIC_MAPTILER_API_KEY

/**
 * Fetch a single MapTiler tile as an Image
 */
async function fetchTile(
  x: number,
  y: number,
  z: number,
  style: string = 'aquarelle'
): Promise<HTMLImageElement> {
  const url = `https://api.maptiler.com/maps/${style}/${z}/${x}/${y}.png?key=${MAPTILER_API_KEY}`

  console.log(`Fetching ${style} tile: ${z}/${x}/${y}`)

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      console.log(`✓ Loaded ${style} tile: ${z}/${x}/${y} (${img.width}x${img.height})`)
      resolve(img)
    }

    img.onerror = (error) => {
      console.error(`✗ Failed ${style} tile: ${z}/${x}/${y}`, error)
      reject(new Error(`Failed to load ${style} tile ${x},${y},${z}`))
    }

    img.src = url
  })
}

/**
 * Fetch all tiles for Dakar bounds and stitch into a single canvas
 */
async function stitchTiles(
  bounds: Bounds,
  zoom: number,
  style: string = 'aquarelle'
): Promise<HTMLCanvasElement> {
  const tiles = getTilesForBounds(bounds, zoom)

  // Calculate canvas size based on tile grid
  const xTiles = new Set(tiles.map((t) => t.x)).size
  const yTiles = new Set(tiles.map((t) => t.y)).size
  const tileSize = 512 // MapTiler tiles are 512x512

  const canvasWidth = xTiles * tileSize
  const canvasHeight = yTiles * tileSize

  console.log(`Stitching ${tiles.length} ${style} tiles (${xTiles}x${yTiles}) at zoom ${zoom}`)

  // Create canvas
  const canvas = document.createElement('canvas')
  canvas.width = canvasWidth
  canvas.height = canvasHeight
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Failed to get canvas 2D context')
  }

  // Get min X and Y for positioning
  const minX = Math.min(...tiles.map((t) => t.x))
  const minY = Math.min(...tiles.map((t) => t.y))

  // Fetch and draw all tiles
  const results = await Promise.allSettled(
    tiles.map(async (tile) => {
      const img = await fetchTile(tile.x, tile.y, tile.z, style)
      const canvasX = (tile.x - minX) * tileSize
      const canvasY = (tile.y - minY) * tileSize
      ctx.drawImage(img, canvasX, canvasY, tileSize, tileSize)
      return { x: tile.x, y: tile.y, success: true }
    })
  )

  // Count successes and failures
  const successful = results.filter((r) => r.status === 'fulfilled').length
  const failed = results.filter((r) => r.status === 'rejected').length

  console.log(`${style} tiles: ${successful} loaded, ${failed} failed`)

  if (successful === 0) {
    throw new Error(`All ${style} tiles failed to load`)
  }

  return canvas
}

/**
 * Apply color adjustments to match WAKTU design system
 * Makes the map warmer and more cohesive with the brand palette
 */
function applyColorGrading(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  // Apply subtle warm tone and increase saturation
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    // Warm tone: boost red/orange, reduce blue slightly
    data[i] = Math.min(255, r * 1.05) // +5% red
    data[i + 1] = Math.min(255, g * 1.02) // +2% green
    data[i + 2] = Math.min(255, b * 0.95) // -5% blue

    // Slight contrast boost
    const contrast = 1.1
    data[i] = ((data[i] - 128) * contrast + 128)
    data[i + 1] = ((data[i + 1] - 128) * contrast + 128)
    data[i + 2] = ((data[i + 2] - 128) * contrast + 128)
  }

  ctx.putImageData(imageData, 0, 0)
  return canvas
}

/**
 * Generate a Three.js texture from MapTiler Aquarelle tiles
 * Caches the result to avoid refetching on subsequent loads
 *
 * @param zoom - Tile zoom level (13 = fast, 14 = detailed, 15 = very detailed)
 * @returns THREE.CanvasTexture ready to apply to terrain
 */
export async function generateMapTexture(
  zoom: number = 14
): Promise<THREE.CanvasTexture> {
  console.log('Generating Dakar map texture...')
  const startTime = performance.now()

  // Stitch tiles
  const canvas = await stitchTiles(DAKAR_BOUNDS, zoom, 'aquarelle')

  // Apply color grading
  const gradedCanvas = applyColorGrading(canvas)

  // Create Three.js texture
  const texture = new THREE.CanvasTexture(gradedCanvas)
  texture.wrapS = THREE.ClampToEdgeWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.generateMipmaps = true
  texture.needsUpdate = true

  const elapsed = performance.now() - startTime
  console.log(`Map texture generated in ${elapsed.toFixed(0)}ms`)
  console.log(`Texture size: ${canvas.width}x${canvas.height}px`)

  return texture
}

/**
 * Preload a simplified map texture for quick initial render
 * Uses lower zoom level for faster loading
 */
export async function generateQuickMapTexture(): Promise<THREE.CanvasTexture> {
  return generateMapTexture(13) // Lower zoom = fewer tiles = faster
}
