'use client'

import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Controls() {
  const { camera, gl } = useThree()
  const isDragging = useRef(false)
  const previousMousePosition = useRef({ x: 0, y: 0 })
  const velocity = useRef({ x: 0, y: 0 })
  const targetPosition = useRef(new THREE.Vector3())

  useEffect(() => {
    const domElement = gl.domElement
    targetPosition.current.copy(camera.position)

    // Mouse down
    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true
      previousMousePosition.current = { x: e.clientX, y: e.clientY }
      velocity.current = { x: 0, y: 0 }
      domElement.style.cursor = 'grabbing'
    }

    // Mouse move - drag to pan
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return

      const deltaX = e.clientX - previousMousePosition.current.x
      const deltaY = e.clientY - previousMousePosition.current.y

      // Pan speed multiplier
      const speed = 0.3

      // Update velocity for momentum
      velocity.current.x = deltaX * speed
      velocity.current.y = deltaY * speed

      // Update target position
      targetPosition.current.x -= deltaX * speed
      targetPosition.current.z -= deltaY * speed

      // Clamp to boundaries (keep camera over the terrain)
      targetPosition.current.x = THREE.MathUtils.clamp(
        targetPosition.current.x,
        -80,
        80
      )
      targetPosition.current.z = THREE.MathUtils.clamp(
        targetPosition.current.z,
        -80,
        80
      )

      previousMousePosition.current = { x: e.clientX, y: e.clientY }
    }

    // Mouse up - apply momentum
    const handleMouseUp = () => {
      isDragging.current = false
      domElement.style.cursor = 'grab'
    }

    // Mouse wheel - zoom
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      const zoomSpeed = 0.1
      const delta = e.deltaY * zoomSpeed

      targetPosition.current.y = THREE.MathUtils.clamp(
        targetPosition.current.y + delta,
        40, // min zoom (close)
        150 // max zoom (far)
      )
    }

    // Set initial cursor
    domElement.style.cursor = 'grab'

    // Add event listeners
    domElement.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    domElement.addEventListener('wheel', handleWheel, { passive: false })

    // Cleanup
    return () => {
      domElement.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      domElement.removeEventListener('wheel', handleWheel)
      domElement.style.cursor = 'auto'
    }
  }, [camera, gl])

  // Smooth camera movement with momentum
  useFrame(() => {
    // Lerp camera to target position
    camera.position.lerp(targetPosition.current, 0.1)

    // Apply momentum when not dragging
    if (!isDragging.current) {
      // Decay velocity
      velocity.current.x *= 0.95
      velocity.current.y *= 0.95

      // Apply velocity to target position
      if (Math.abs(velocity.current.x) > 0.01 || Math.abs(velocity.current.y) > 0.01) {
        targetPosition.current.x -= velocity.current.x
        targetPosition.current.z -= velocity.current.y

        // Clamp
        targetPosition.current.x = THREE.MathUtils.clamp(
          targetPosition.current.x,
          -80,
          80
        )
        targetPosition.current.z = THREE.MathUtils.clamp(
          targetPosition.current.z,
          -80,
          80
        )
      }
    }

    // Camera always looks at center
    camera.lookAt(camera.position.x, 0, camera.position.z)
  })

  return null
}
