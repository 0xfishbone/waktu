import gsap from 'gsap'
import * as THREE from 'three'

/**
 * Animation utilities for camera movements using GSAP
 * Provides smooth fly-to animations when clicking markers
 */

export interface FlyToOptions {
  /** Target position to look at */
  target: THREE.Vector3
  /** Camera position to fly to */
  cameraPosition: THREE.Vector3
  /** Animation duration in seconds */
  duration?: number
  /** GSAP easing function */
  ease?: string
  /** Callback when animation completes */
  onComplete?: () => void
}

/**
 * Animates camera to fly to a specific position while looking at a target
 * Works with custom controls by animating camera position directly
 *
 * @param camera - Three.js camera instance
 * @param options - Animation options
 * @returns GSAP timeline for the animation
 */
export function flyToPosition(
  camera: THREE.Camera,
  options: FlyToOptions
): gsap.core.Timeline {
  const {
    target,
    cameraPosition,
    duration = 1.5,
    ease = 'power2.inOut',
    onComplete,
  } = options

  // Store original lookAt behavior
  const lookAtTarget = target.clone()

  // Create timeline for synchronized animations
  const timeline = gsap.timeline({
    onComplete,
  })

  // Animate camera position
  timeline.to(
    camera.position,
    {
      x: cameraPosition.x,
      y: cameraPosition.y,
      z: cameraPosition.z,
      duration,
      ease,
      onUpdate: () => {
        // Update camera to look at target during animation
        camera.lookAt(lookAtTarget)
      },
    },
    0
  )

  return timeline
}

/**
 * Calculate optimal camera position for viewing a marker
 * Positions camera at an angle to view marker from above and to the side
 *
 * @param markerPosition - World position of the marker
 * @param distance - Distance from marker to camera
 * @param angleY - Vertical angle in degrees (0 = level, 90 = top-down)
 * @param angleXZ - Horizontal angle in degrees (rotation around marker)
 * @returns Calculated camera position
 */
export function calculateCameraPosition(
  markerPosition: THREE.Vector3,
  distance: number = 30,
  angleY: number = 45,
  angleXZ: number = 45
): THREE.Vector3 {
  // Convert angles to radians
  const phi = (90 - angleY) * (Math.PI / 180) // Polar angle
  const theta = angleXZ * (Math.PI / 180) // Azimuthal angle

  // Spherical to Cartesian coordinates
  const x = markerPosition.x + distance * Math.sin(phi) * Math.cos(theta)
  const y = markerPosition.y + distance * Math.cos(phi)
  const z = markerPosition.z + distance * Math.sin(phi) * Math.sin(theta)

  return new THREE.Vector3(x, y, z)
}

/**
 * Fly to a marker with pre-calculated optimal viewing angle
 * Convenience function that combines calculateCameraPosition and flyToPosition
 *
 * @param camera - Three.js camera instance
 * @param markerPosition - World position of the marker to view
 * @param options - Optional animation settings
 * @returns GSAP timeline
 */
export function flyToMarker(
  camera: THREE.Camera,
  markerPosition: THREE.Vector3,
  options: {
    distance?: number
    angleY?: number
    angleXZ?: number
    duration?: number
    ease?: string
    onComplete?: () => void
  } = {}
): gsap.core.Timeline {
  const {
    distance = 30,
    angleY = 45,
    angleXZ = 45,
    duration = 1.5,
    ease = 'power2.inOut',
    onComplete,
  } = options

  const cameraPosition = calculateCameraPosition(
    markerPosition,
    distance,
    angleY,
    angleXZ
  )

  return flyToPosition(camera, {
    target: markerPosition,
    cameraPosition,
    duration,
    ease,
    onComplete,
  })
}

/**
 * Reset camera to default overview position
 *
 * @param camera - Three.js camera instance
 * @param defaultPosition - Default camera position (defaults to Dakar overview)
 * @param defaultTarget - Default look-at target (defaults to terrain center)
 * @param duration - Animation duration in seconds
 * @returns GSAP timeline
 */
export function resetCamera(
  camera: THREE.Camera,
  defaultPosition: THREE.Vector3 = new THREE.Vector3(0, 80, 100),
  defaultTarget: THREE.Vector3 = new THREE.Vector3(0, 0, 0),
  duration: number = 1.5
): gsap.core.Timeline {
  return flyToPosition(camera, {
    target: defaultTarget,
    cameraPosition: defaultPosition,
    duration,
    ease: 'power2.inOut',
  })
}
