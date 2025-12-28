/**
 * Coordinate projection utilities for converting lng/lat to 3D world space
 * Uses Web Mercator projection for Dakar bounds
 */

export interface Bounds {
  west: number   // Min longitude
  south: number  // Min latitude
  east: number   // Max longitude
  north: number  // Max latitude
}

export interface WorldPosition {
  x: number
  z: number
}

/**
 * Dakar bounds for the map
 * Covers the entire Dakar peninsula and surrounding areas
 */
export const DAKAR_BOUNDS: Bounds = {
  west: -17.55,
  south: 14.62,
  east: -17.35,
  north: 14.80,
}

/**
 * Dakar center point for camera positioning
 */
export const DAKAR_CENTER = {
  lng: -17.4441,
  lat: 14.6937,
}

/**
 * Convert latitude to Web Mercator Y coordinate
 */
function latitudeToMercatorY(lat: number): number {
  const latRad = (lat * Math.PI) / 180
  return Math.log(Math.tan(Math.PI / 4 + latRad / 2))
}

/**
 * Convert [lng, lat] coordinates to 3D world [x, z] position
 *
 * @param lng - Longitude (e.g., -17.4677)
 * @param lat - Latitude (e.g., 14.7167)
 * @param bounds - Map bounds (default: DAKAR_BOUNDS)
 * @param worldSize - Size of the terrain in Three.js units (default: 100)
 * @returns [x, z] position in 3D world space
 *
 * Example:
 * const [x, z] = lngLatToWorld(-17.4677, 14.7167)
 * // Returns: [12.5, -23.8] (approximate)
 */
export function lngLatToWorld(
  lng: number,
  lat: number,
  bounds: Bounds = DAKAR_BOUNDS,
  worldSize: number = 100
): WorldPosition {
  // Normalize longitude to 0-1 range
  const xNormalized = (lng - bounds.west) / (bounds.east - bounds.west)

  // Convert latitudes to Mercator Y coordinates
  const mercatorSouth = latitudeToMercatorY(bounds.south)
  const mercatorNorth = latitudeToMercatorY(bounds.north)
  const mercatorLat = latitudeToMercatorY(lat)

  // Normalize latitude to 0-1 range using Mercator projection
  const yNormalized = (mercatorLat - mercatorSouth) / (mercatorNorth - mercatorSouth)

  // Convert to Three.js world coordinates
  // Center at origin (0,0) and scale to worldSize
  const x = (xNormalized - 0.5) * worldSize
  const z = (0.5 - yNormalized) * worldSize  // Invert Y because Three.js Z points backward

  return { x, z }
}

/**
 * Convert 3D world [x, z] position back to [lng, lat] coordinates
 * Inverse of lngLatToWorld
 */
export function worldToLngLat(
  x: number,
  z: number,
  bounds: Bounds = DAKAR_BOUNDS,
  worldSize: number = 100
): [number, number] {
  // Convert from centered coordinates back to normalized 0-1 range
  const xNormalized = x / worldSize + 0.5
  const yNormalized = 0.5 - z / worldSize

  // Convert X to longitude
  const lng = bounds.west + xNormalized * (bounds.east - bounds.west)

  // Convert Y back to latitude using inverse Mercator projection
  const mercatorSouth = latitudeToMercatorY(bounds.south)
  const mercatorNorth = latitudeToMercatorY(bounds.north)
  const mercatorLat = mercatorSouth + yNormalized * (mercatorNorth - mercatorSouth)

  // Inverse Mercator formula
  const lat = (Math.atan(Math.exp(mercatorLat)) * 2 - Math.PI / 2) * (180 / Math.PI)

  return [lng, lat]
}

/**
 * Calculate tile coordinates for a given lng/lat and zoom level
 * Used for fetching MapTiler tiles
 */
export function lngLatToTile(
  lng: number,
  lat: number,
  zoom: number
): { x: number; y: number; z: number } {
  const n = Math.pow(2, zoom)
  const x = Math.floor(((lng + 180) / 360) * n)

  const latRad = (lat * Math.PI) / 180
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  )

  return { x, y, z: zoom }
}

/**
 * Calculate all tiles needed to cover a bounding box at a given zoom
 * Returns array of {x, y, z} tile coordinates
 */
export function getTilesForBounds(
  bounds: Bounds,
  zoom: number
): Array<{ x: number; y: number; z: number }> {
  const topLeft = lngLatToTile(bounds.west, bounds.north, zoom)
  const bottomRight = lngLatToTile(bounds.east, bounds.south, zoom)

  const tiles: Array<{ x: number; y: number; z: number }> = []

  for (let x = topLeft.x; x <= bottomRight.x; x++) {
    for (let y = topLeft.y; y <= bottomRight.y; y++) {
      tiles.push({ x, y, z: zoom })
    }
  }

  return tiles
}

/**
 * Calculate the distance in meters between two lng/lat coordinates
 * Uses Haversine formula
 */
export function distanceInMeters(
  lng1: number,
  lat1: number,
  lng2: number,
  lat2: number
): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lng2 - lng1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}
