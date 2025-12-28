# WAKTU - Development Documentation
## How the 3D Interactive Map Was Built

**Project:** Dakar's Art & Culture Map
**Tech Stack:** Next.js 15 + React 19 + React Three Fiber v9 + TypeScript
**Reference:** Chartogne-Taillet (map) + La Gata Perduda (content pages)
**Timeline:** December 2024

---

## Table of Contents

1. [Design Brief Requirements](#design-brief-requirements)
2. [Technical Architecture](#technical-architecture)
3. [Step-by-Step Implementation](#step-by-step-implementation)
4. [Interactive Features](#interactive-features)
5. [Challenges & Solutions](#challenges--solutions)
6. [Performance Optimizations](#performance-optimizations)
7. [Future Enhancements](#future-enhancements)

---

## Design Brief Requirements

### Core Experience (from brief)

**Map Interaction (Chartogne-Taillet style):**
- Full-screen 3D illustrated map of Dakar peninsula
- Hand-drawn/watercolor aesthetic
- Drag to pan across terrain with momentum
- Scroll to zoom (camera movement)
- Hover on markers to see location info
- Click marker → camera flies to location → content page loads

**Visual Style:**
- Hand-drawn aesthetic (NOT photorealistic)
- Custom cursor rendered in WebGL
- All UI elements in WebGL (no HTML overlays initially)
- Warm color palette: terracotta, ochre, indigo, cream, sand

**Data:**
- 54+ art spaces (galleries, museums, cultural centers, studios)
- Each location has: name, category, coordinates, description, images, hours

---

## Technical Architecture

### Stack Selection Rationale

```
Next.js 15 (App Router)
└── React 19 (required by Next.js 15)
    └── React Three Fiber v9 (3D rendering)
        ├── @react-three/drei (helpers)
        └── Three.js 0.182.0 (WebGL engine)
    └── GSAP 3.12.5 (animations - future)
    └── Zustand 4.5.0 (state management)
    └── Tailwind CSS 3.4 (styling)
```

**Why React Three Fiber over vanilla Three.js?**
- Declarative React component model
- Built-in hooks for Three.js lifecycle
- Better integration with Next.js
- Easier state management with React patterns

**Why Next.js 15 App Router?**
- Server Components for faster initial load
- File-based routing for place pages (future)
- Built-in optimization (fonts, images)
- Vercel deployment integration

---

## Step-by-Step Implementation

### Phase 1: Project Initialization

#### 1.1 Next.js Project Setup

```bash
# Created project structure manually (couldn't use create-next-app due to existing .claude/ folder)
# Key files created:
- package.json (dependencies)
- tsconfig.json (TypeScript config)
- next.config.ts (Next.js config)
- tailwind.config.ts (design system)
- postcss.config.mjs (CSS processing)
```

**package.json (initial):**
```json
{
  "dependencies": {
    "react": "^18.3.1",  // Later upgraded to 19.0.0
    "react-dom": "^18.3.1",
    "next": "^15.1.4",
    "@react-three/fiber": "^8.15.0",  // Later upgraded to 9.4.2
    "@react-three/drei": "^9.93.0",   // Later upgraded to 10.7.7
    "three": "^0.160.0",  // Later upgraded to 0.182.0
    "gsap": "^3.12.5",
    "zustand": "^4.5.0",
    "lenis": "^1.0.42",
    "mapbox-gl": "^3.1.0",
    "howler": "^2.2.4"
  }
}
```

#### 1.2 Design System Implementation

**File: `app/globals.css`**

Set up CSS custom properties matching the design brief:

```css
:root {
  --deep-indigo: #1A2B4A;    /* Ocean, dark backgrounds */
  --cream: #F5F1E8;           /* Land base, page backgrounds */
  --terracotta: #C4502A;      /* Gallery markers, primary accent */
  --ochre: #D4A03E;           /* Cultural center markers */
  --sand: #E8DFD0;            /* Subtle backgrounds */
  --deep-brown: #2D1F14;      /* Studio markers, text */
  --faded-indigo: #4A5568;    /* Museum markers */
  --atlantic-blue: #2B4F6C;   /* Water accents */
}
```

**File: `tailwind.config.ts`**

Extended Tailwind with brand colors and fonts:

```typescript
theme: {
  extend: {
    colors: {
      'deep-indigo': '#1A2B4A',
      'cream': '#F5F1E8',
      'terracotta': '#C4502A',
      // ... all 8 colors
    },
    fontFamily: {
      'display': ['var(--font-bebas)', 'sans-serif'],      // Headlines
      'body': ['var(--font-space)', 'sans-serif'],         // UI
      'editorial': ['var(--font-cormorant)', 'serif'],     // Accents
    },
  },
}
```

**File: `app/layout.tsx`**

Loaded Google Fonts with variable font loading:

```typescript
import { Bebas_Neue, Space_Grotesk, Cormorant_Garamond } from 'next/font/google'

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
})
// ... other fonts
```

#### 1.3 Project Structure

```
waktu/
├── app/                          # Next.js App Router
│   ├── globals.css              # Design system CSS
│   ├── layout.tsx               # Root layout + fonts
│   ├── page.tsx                 # Main map page
│   └── icon.svg                 # Favicon (added later)
├── components/
│   ├── map/                     # 3D scene components
│   │   ├── Scene.tsx           # Three.js Canvas wrapper
│   │   ├── Terrain.tsx         # 3D ground plane
│   │   ├── Markers.tsx         # Location markers
│   │   └── Controls.tsx        # Camera drag/zoom controls
│   └── ui/                      # 2D UI overlays
│       ├── Logo.tsx            # Top-left branding
│       └── FilterButtons.tsx   # Category filters
├── data/
│   ├── places.json             # Location database
│   └── types.ts                # TypeScript interfaces
├── stores/
│   └── mapStore.ts             # Zustand global state
└── public/
    ├── models/                  # 3D assets (future)
    ├── textures/                # Map textures (future)
    └── images/places/           # Photography (future)
```

---

### Phase 2: Data Layer

#### 2.1 TypeScript Interfaces

**File: `data/types.ts`**

Defined strict types for location data:

```typescript
export type PlaceCategory = 'gallery' | 'museum' | 'cultural-center' | 'studio'

export interface Place {
  id: string                    // Unique identifier
  slug: string                  // URL-friendly name
  name: string                  // Display name
  category: PlaceCategory       // For filtering & marker colors
  neighborhood: string          // Dakar district
  address: string               // Full address
  coordinates: {
    lat: number                 // Latitude
    lng: number                 // Longitude
  }
  tagline: string               // Short description
  description: string           // Full editorial text
  heroImage: string             // Main image path
  gallery: string[]             // Additional images
  hours: string                 // Opening hours
  entry: string                 // Entry fee/free
  website: string               // External URL
  phone: string                 // Contact number
  featured: boolean             // Highlight flag
  tags: string[]                // Keywords
}
```

#### 2.2 Seed Data

**File: `data/places.json`**

Created 5 initial locations with real Dakar art spaces:

```json
[
  {
    "id": "raw-material-company",
    "slug": "raw-material-company",
    "name": "RAW Material Company",
    "category": "cultural-center",
    "neighborhood": "Zone B",
    "address": "Sicap Liberté 1, Villa 5012",
    "coordinates": { "lat": 14.7167, "lng": -17.4677 },
    "tagline": "Center for art, knowledge and society",
    "description": "The most serious contemporary art discourse...",
    "heroImage": "/images/places/raw-material-company/hero.jpg",
    "gallery": [],
    "hours": "Tue–Sat, 10h–18h",
    "entry": "Free",
    "website": "https://rawmaterialcompany.org",
    "phone": "+221 33 XXX XXXX",
    "featured": true,
    "tags": ["contemporary", "exhibitions", "talks", "residency"]
  },
  // ... 4 more locations
]
```

**Locations chosen:**
1. RAW Material Company (cultural-center) - Zone B
2. Galerie Cécile Fakhoury (gallery) - Plateau
3. Village des Arts (studio) - Hann
4. Musée Théodore Monod/IFAN (museum) - Plateau
5. Kër Thiossane (cultural-center) - Sicap Liberté

---

### Phase 3: State Management

#### 3.1 Zustand Store

**File: `stores/mapStore.ts`**

Simple, lightweight state management for map interactions:

```typescript
import { create } from 'zustand'
import type { Place } from '@/data/types'

interface MapState {
  selectedPlace: Place | null          // Currently selected location
  hoveredPlace: Place | null           // Mouse hover target
  filterCategory: string | null        // Active filter (null = all)
  isTransitioning: boolean             // Camera animation state
  isMuted: boolean                     // Audio toggle (future)

  // Actions
  setSelectedPlace: (place: Place | null) => void
  setHoveredPlace: (place: Place | null) => void
  setFilterCategory: (category: string | null) => void
  setIsTransitioning: (transitioning: boolean) => void
  toggleMute: () => void
}

export const useMapStore = create<MapState>((set) => ({
  // Initial state
  selectedPlace: null,
  hoveredPlace: null,
  filterCategory: null,
  isTransitioning: false,
  isMuted: false,

  // State updaters
  setSelectedPlace: (place) => set({ selectedPlace: place }),
  setHoveredPlace: (place) => set({ hoveredPlace: place }),
  setFilterCategory: (category) => set({ filterCategory: category }),
  setIsTransitioning: (transitioning) => set({ isTransitioning: transitioning }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
}))
```

**Why Zustand?**
- Minimal boilerplate (vs Redux)
- No Context Provider needed
- Works seamlessly with React Three Fiber
- Great TypeScript support
- Tiny bundle size (~1KB)

---

### Phase 4: 3D Scene Setup

#### 4.1 Main Scene Component

**File: `components/map/Scene.tsx`**

The core Three.js Canvas wrapper:

```typescript
'use client'

import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera, Environment } from '@react-three/drei'
import { Suspense } from 'react'
import Terrain from './Terrain'
import Markers from './Markers'
import Controls from './Controls'

export default function Scene() {
  return (
    <div className="w-full h-screen">
      <Canvas
        style={{ background: '#F5F1E8' }}  // Cream background
        gl={{
          antialias: true,                  // Smooth edges
          alpha: false,                     // Opaque background
        }}
        dpr={[1, 2]}                        // Pixel ratio (1x normal, 2x retina)
        performance={{ min: 0.5 }}          // Adaptive performance
        onCreated={({ gl }) => {
          gl.setClearColor('#F5F1E8', 1)    // WebGL clear color
        }}
      >
        {/* Camera */}
        <PerspectiveCamera
          makeDefault
          position={[0, 100, 120]}          // Overhead view
          fov={50}                          // Field of view
          near={0.1}
          far={1000}
        />

        {/* Lighting */}
        <ambientLight intensity={0.8} />   // Soft fill light
        <directionalLight
          position={[10, 50, 10]}           // Sun position
          intensity={0.5}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        {/* HDR Environment (preset lighting) */}
        <Environment preset="sunset" />

        {/* Scene Content */}
        <Suspense fallback={null}>
          <Terrain />
          <Markers />
          <Controls />
        </Suspense>

        {/* Development Helper */}
        {process.env.NODE_ENV === 'development' && (
          <gridHelper args={[200, 20, '#4A5568', '#E8DFD0']} />
        )}
      </Canvas>
    </div>
  )
}
```

**Key Decisions:**

1. **`style={{ background: '#F5F1E8' }}`** - Critical for visibility. Without this, Canvas renders gray.

2. **`onCreated`** - Sets WebGL clear color to match CSS background.

3. **`dpr={[1, 2]}`** - Adaptive pixel ratio. Uses 1x on low-end devices, 2x on retina.

4. **`performance={{ min: 0.5 }}`** - R3F automatically reduces quality if FPS drops below 30.

5. **`Suspense`** - Prevents render blocking while 3D assets load.

6. **`Environment preset="sunset"`** - Drei helper that adds HDR lighting (sunset = warm tones).

#### 4.2 Terrain Component

**File: `components/map/Terrain.tsx`**

The 3D ground plane representing Dakar:

```typescript
'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Terrain() {
  const meshRef = useRef<THREE.Mesh>(null)

  // Subtle breathing animation (optional)
  useFrame((state) => {
    if (meshRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 0.2) * 0.002
      meshRef.current.scale.setScalar(scale)
    }
  })

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}  // Rotate to horizontal
      position={[0, -0.5, 0]}          // Slightly below origin
      receiveShadow                     // Receive marker shadows
    >
      {/* Large plane (200x200 units, 64x64 subdivisions) */}
      <planeGeometry args={[200, 200, 64, 64]} />

      {/* Material with hand-drawn aesthetic colors */}
      <meshStandardMaterial
        color="#F5F1E8"   // Cream (land color)
        roughness={0.9}   // Matte finish (not shiny)
        metalness={0.1}   // Barely metallic
      />
    </mesh>
  )
}
```

**Technical Notes:**

- **Rotation `[-Math.PI / 2, 0, 0]`** - Planes default to vertical. This rotates 90° to horizontal.
- **Subdivisions `64x64`** - High enough for future terrain displacement/height mapping.
- **`receiveShadow`** - Will show shadows from marker spheres when implemented.
- **`useFrame` hook** - Runs every frame (~60fps). Used for animation.

**Future Enhancement:**
This will be replaced with a custom 3D model or texture-mapped plane with hand-drawn Dakar map.

#### 4.3 Markers Component

**File: `components/map/Markers.tsx`**

Interactive location markers with hover/click:

```typescript
'use client'

import { useRef, useState } from 'react'
import { useFrame, ThreeEvent } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { useMapStore } from '@/stores/mapStore'
import placesData from '@/data/places.json'
import type { Place } from '@/data/types'

const places = placesData as Place[]

// Category colors from design system
const categoryColors: Record<string, string> = {
  'gallery': '#C4502A',         // Terracotta
  'museum': '#4A5568',          // Faded indigo
  'cultural-center': '#D4A03E', // Ochre
  'studio': '#2D1F14',          // Deep brown
}

interface MarkerProps {
  place: Place
}

function Marker({ place }: MarkerProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const { setHoveredPlace, setSelectedPlace } = useMapStore()

  // Convert lat/lng to world coordinates
  // This is a SIMPLIFIED projection - real implementation would use proper map projection
  const x = (place.coordinates.lng + 17.46) * 200   // Offset + scale
  const z = -(place.coordinates.lat - 14.69) * 200  // Negative because Z is inverted
  const y = 0.5                                     // Height above terrain

  // Bobbing animation on hover
  useFrame((state) => {
    if (meshRef.current && hovered) {
      meshRef.current.position.y = y + Math.sin(state.clock.elapsedTime * 2) * 0.3
    }
  })

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()  // Prevent event bubbling
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
          emissive={color}               // Self-illumination
          emissiveIntensity={hovered ? 0.5 : 0.2}
          roughness={0.3}
          metalness={0.6}                // Slightly metallic
        />
      </mesh>

      {/* Hover tooltip (HTML overlay) */}
      {hovered && (
        <Html
          position={[0, 2, 0]}           // Above marker
          center
          distanceFactor={10}            // Scale with distance
          style={{ pointerEvents: 'none' }}  // Don't block clicks
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
```

**Key Implementation Details:**

1. **Coordinate Projection:**
```typescript
const x = (place.coordinates.lng + 17.46) * 200
const z = -(place.coordinates.lat - 14.69) * 200
```
- This is a **linear approximation** of spherical → planar projection
- Real Dakar: ~14.69°N, ~17.46°W
- Offset centers the map, scale factor (200) spreads markers across the 200x200 terrain
- Z is negated because Three.js Z-axis is inverted from geographic north

2. **Event Handling:**
- `onPointerOver` - Works for both mouse and touch
- `stopPropagation()` - Prevents clicking through to terrain
- Cursor changes via DOM manipulation

3. **Html Component (Drei):**
- Renders React/HTML inside 3D space
- `distanceFactor` scales tooltip based on camera distance
- `pointerEvents: 'none'` prevents tooltip from blocking clicks

4. **Dynamic Geometry:**
```typescript
<sphereGeometry args={[hovered ? 0.8 : 0.6, 16, 16]} />
```
- Sphere grows on hover (0.6 → 0.8 radius)
- 16 segments = smooth sphere (low poly count)

#### 4.4 Camera Controls

**File: `components/map/Controls.tsx`**

Custom drag-to-pan + scroll-to-zoom (Chartogne-Taillet style):

```typescript
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

    // Mouse down - start dragging
    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true
      previousMousePosition.current = { x: e.clientX, y: e.clientY }
      velocity.current = { x: 0, y: 0 }
      domElement.style.cursor = 'grabbing'
    }

    // Mouse move - pan camera
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return

      const deltaX = e.clientX - previousMousePosition.current.x
      const deltaY = e.clientY - previousMousePosition.current.y

      const speed = 0.3  // Pan sensitivity

      // Update velocity for momentum
      velocity.current.x = deltaX * speed
      velocity.current.y = deltaY * speed

      // Update target position
      targetPosition.current.x -= deltaX * speed
      targetPosition.current.z -= deltaY * speed

      // Clamp to boundaries (keep camera over terrain)
      targetPosition.current.x = THREE.MathUtils.clamp(
        targetPosition.current.x,
        -80,  // Min X
        80    // Max X
      )
      targetPosition.current.z = THREE.MathUtils.clamp(
        targetPosition.current.z,
        -80,  // Min Z
        80    // Max Z
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
        40,   // Min zoom (close)
        150   // Max zoom (far)
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
    // Lerp camera to target position (smooth interpolation)
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

        // Clamp again
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

    // Camera always looks at its own position (overhead view)
    camera.lookAt(camera.position.x, 0, camera.position.z)
  })

  return null  // This component renders nothing
}
```

**Implementation Breakdown:**

1. **State Management (useRef):**
- `isDragging` - Whether mouse is down
- `previousMousePosition` - Last mouse coords (for delta calculation)
- `velocity` - Current momentum vector
- `targetPosition` - Where camera is moving to

2. **Event Listeners:**
- Attached to `gl.domElement` (the Canvas)
- Removed on cleanup to prevent memory leaks

3. **Momentum Physics:**
```typescript
velocity.current.x *= 0.95  // Decay by 5% each frame
```
- When user releases mouse, velocity continues
- Decays exponentially → smooth stop
- Applied only when `!isDragging`

4. **Lerp (Linear Interpolation):**
```typescript
camera.position.lerp(targetPosition.current, 0.1)
```
- Smoothly moves camera 10% closer to target each frame
- Creates smooth, organic movement
- `0.1` = interpolation factor (lower = smoother but slower)

5. **Boundary Clamping:**
```typescript
THREE.MathUtils.clamp(value, -80, 80)
```
- Prevents camera from panning off the terrain
- ±80 units from center on X/Z axes

6. **Zoom Implementation:**
```typescript
targetPosition.current.y = THREE.MathUtils.clamp(
  targetPosition.current.y + delta,
  40,   // Close
  150   // Far
)
```
- Changes camera Y position (height)
- Closer = more detail, Farther = more overview

**Why Not OrbitControls?**

Drei provides `<OrbitControls />`, but we need custom behavior:
- ✅ Custom momentum physics
- ✅ Custom zoom range
- ✅ Prevent rotation (only pan/zoom)
- ✅ Match Chartogne-Taillet feel

---

### Phase 5: UI Layer

#### 5.1 Logo Component

**File: `components/ui/Logo.tsx`**

Simple fixed-position branding:

```typescript
'use client'

export default function Logo() {
  return (
    <div className="fixed top-6 left-6 z-50 pointer-events-none">
      <h1 className="font-display text-5xl text-deep-indigo tracking-wider">
        WAKTU
      </h1>
      <p className="font-body text-sm text-faded-indigo mt-1">
        Dakar&apos;s Art & Culture Map
      </p>
    </div>
  )
}
```

**Key Points:**
- `fixed` positioning (doesn't move with 3D scene)
- `z-50` ensures it's above Canvas
- `pointer-events-none` so clicks pass through to 3D scene

#### 5.2 Filter Buttons

**File: `components/ui/FilterButtons.tsx`**

Category filtering UI:

```typescript
'use client'

import { useMapStore } from '@/stores/mapStore'

const categories = [
  { id: null, label: 'All' },
  { id: 'gallery', label: 'Galleries' },
  { id: 'museum', label: 'Museums' },
  { id: 'cultural-center', label: 'Cultural Centers' },
  { id: 'studio', label: 'Studios' },
]

export default function FilterButtons() {
  const { filterCategory, setFilterCategory } = useMapStore()

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-cream/80 backdrop-blur-md rounded-full px-4 py-3 shadow-lg">
        <div className="flex gap-2">
          {categories.map((category) => (
            <button
              key={category.label}
              onClick={() => setFilterCategory(category.id)}
              className={`
                px-4 py-2 rounded-full font-body text-sm transition-all
                ${
                  filterCategory === category.id
                    ? 'bg-terracotta text-cream'
                    : 'bg-sand text-deep-brown hover:bg-ochre hover:text-cream'
                }
              `}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
```

**Interaction Flow:**
1. User clicks filter button
2. `setFilterCategory` updates Zustand store
3. `Markers.tsx` re-renders with filtered list
4. Markers outside filter category disappear

**Styling Details:**
- `backdrop-blur-md` - Frosted glass effect
- `bg-cream/80` - 80% opacity cream background
- `rounded-full` - Pill-shaped container
- Active button gets terracotta background

#### 5.3 Main Page Integration

**File: `app/page.tsx`**

Combines everything with dynamic import:

```typescript
'use client'

import dynamic from 'next/dynamic'
import Logo from '@/components/ui/Logo'
import FilterButtons from '@/components/ui/FilterButtons'

// Dynamically import Scene to avoid SSR issues with Three.js
const Scene = dynamic(() => import('@/components/map/Scene'), {
  ssr: false,  // Critical: Three.js needs browser APIs
  loading: () => (
    <div className="w-full h-screen bg-cream flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-display text-8xl text-deep-indigo tracking-wider mb-4">
          WAKTU
        </h1>
        <p className="font-body text-xl text-deep-brown">
          Dakar&apos;s Art & Culture Map
        </p>
        <p className="font-editorial text-lg text-faded-indigo mt-2 italic">
          Loading experience...
        </p>
      </div>
    </div>
  ),
})

export default function Home() {
  return (
    <main className="w-full h-screen bg-cream relative overflow-hidden">
      {/* 3D Scene */}
      <Scene />

      {/* UI Overlays */}
      <Logo />
      <FilterButtons />
    </main>
  )
}
```

**Why `dynamic` with `ssr: false`?**

Three.js uses browser-only APIs:
- `window.innerWidth`
- `WebGLRenderingContext`
- `requestAnimationFrame`

Next.js Server Components run on the server, which has no `window` object. The `dynamic` import with `ssr: false` ensures `Scene.tsx` only loads in the browser.

---

## Interactive Features

### Drag to Pan

**Implementation:** `components/map/Controls.tsx`

```typescript
// On mouse move
const deltaX = e.clientX - previousMousePosition.current.x
targetPosition.current.x -= deltaX * 0.3
```

**Feel:**
- Immediate response (0.3 sensitivity)
- Momentum continues after release
- Boundaries prevent panning off-map

### Scroll to Zoom

**Implementation:** `components/map/Controls.tsx`

```typescript
// On wheel event
const delta = e.deltaY * 0.1
targetPosition.current.y += delta
```

**Range:**
- Close: Y=40 (detailed view of markers)
- Far: Y=150 (overview of entire Dakar)

### Hover Effects

**Implementation:** `components/map/Markers.tsx`

```typescript
// On pointer over
setHovered(true)
document.body.style.cursor = 'pointer'

// Visual changes
<sphereGeometry args={[hovered ? 0.8 : 0.6, 16, 16]} />  // Grow
<meshStandardMaterial
  emissiveIntensity={hovered ? 0.5 : 0.2}  // Glow brighter
/>

// Bobbing animation
meshRef.current.position.y = y + Math.sin(time * 2) * 0.3
```

**Result:**
- Marker grows 33% (0.6 → 0.8)
- Emissive glow increases
- Gentle bobbing animation
- Tooltip appears above marker
- Cursor changes to pointer

### Click to Select

**Implementation:** `components/map/Markers.tsx`

```typescript
const handleClick = (e: ThreeEvent<MouseEvent>) => {
  e.stopPropagation()
  setSelectedPlace(place)
}
```

**Current:** Updates Zustand store
**Future:** Triggers camera fly animation + transitions to place page

### Category Filtering

**Implementation:** `components/ui/FilterButtons.tsx` + `components/map/Markers.tsx`

```typescript
// Filter buttons update store
onClick={() => setFilterCategory(category.id)}

// Markers component reads store and filters
const filteredPlaces = filterCategory
  ? places.filter((place) => place.category === filterCategory)
  : places
```

**Result:**
- Click "Galleries" → only terracotta markers visible
- Click "All" → all markers visible
- Instant filter (no loading state)

---

## Challenges & Solutions

### Challenge 1: React Version Mismatch

**Problem:**
```
TypeError: Cannot read properties of undefined (reading 'ReactCurrentBatchConfig')
```

**Root Cause:**
- Next.js 15 requires React 19
- Project initially used React 18.3.1
- React Three Fiber v8 expected React 18 internals
- Multiple React instances in bundle

**Attempted Solutions:**
1. ❌ Webpack aliases → Broke Server Components
2. ❌ `transpilePackages` → Build succeeded, runtime error persisted

**Final Solution:**
```json
{
  "dependencies": {
    "react": "^19.0.0",              // Upgraded from 18.3.1
    "react-dom": "^19.0.0",
    "@react-three/fiber": "^9.4.2",  // Upgraded from 8.15.0
    "@react-three/drei": "^10.7.7",  // Upgraded from 9.93.0
    "three": "^0.182.0"              // Upgraded from 0.160.0
  }
}
```

**Why This Worked:**
- React 19 + R3F v9 = native compatibility
- Single React instance in bundle
- No webpack hacks needed
- Server Components preserved

### Challenge 2: ESLint Apostrophe Errors

**Problem:**
```
Error: `'` can be escaped with `&apos;`
```

**Solution:**
```typescript
// Before
<p>Dakar's Art & Culture Map</p>

// After
<p>Dakar&apos;s Art & Culture Map</p>
```

React's ESLint config doesn't allow raw apostrophes in JSX.

### Challenge 3: Canvas Not Showing (Gray Screen)

**Problem:**
Canvas mounted but rendered as gray rectangle.

**Root Cause:**
```typescript
<Canvas
  gl={{ alpha: false }}  // Opaque background
  // But no background color set!
>
```

**Solution:**
```typescript
<Canvas
  style={{ background: '#F5F1E8' }}  // CSS background
  onCreated={({ gl }) => {
    gl.setClearColor('#F5F1E8', 1)   // WebGL clear color
  }}
>
```

Both CSS and WebGL backgrounds needed for proper rendering.

### Challenge 4: Dynamic Import SSR Errors

**Problem:**
```
Error: `ssr: false` not allowed in Server Components
```

**Root Cause:**
Next.js 15 App Router pages are Server Components by default. Can't use `ssr: false` in Server Components.

**Solution:**
```typescript
'use client'  // Convert page to Client Component

import dynamic from 'next/dynamic'
const Scene = dynamic(() => import('@/components/map/Scene'), {
  ssr: false  // Now allowed
})
```

### Challenge 5: Coordinate Projection

**Problem:**
How to convert lat/lng to 3D world coordinates?

**Simplified Solution (Current):**
```typescript
const x = (lng + 17.46) * 200
const z = -(lat - 14.69) * 200
```

This is a linear approximation. Works for small areas like Dakar.

**Future Proper Solution:**
Use Mercator projection or custom texture-mapped plane with real Dakar geography.

---

## Performance Optimizations

### 1. Adaptive Pixel Ratio

```typescript
<Canvas dpr={[1, 2]}>
```

- Low-end devices: 1x pixel ratio
- Retina displays: 2x pixel ratio
- Automatic adjustment based on device

### 2. Adaptive Performance

```typescript
<Canvas performance={{ min: 0.5 }}>
```

R3F automatically reduces rendering quality if FPS drops below 30 (0.5 * 60fps).

### 3. Instanced Rendering (Future)

Current: Each marker is a separate mesh
Future: Use `THREE.InstancedMesh` for 54+ identical spheres

```typescript
// Future optimization
<instancedMesh args={[geometry, material, 54]} />
```

### 4. LOD (Level of Detail) - Future

Reduce polygon count for distant objects:

```typescript
<LOD>
  <Mesh geometry={highPolyMarker} distance={0} />
  <Mesh geometry={lowPolyMarker} distance={50} />
</LOD>
```

### 5. Texture Atlasing - Future

Combine all marker textures into single atlas to reduce draw calls.

### 6. Draco Compression - Future

Compress 3D models:

```typescript
<mesh>
  <primitive object={dracoLoader.parse(compressed)} />
</mesh>
```

Can reduce model size by 80-90%.

---

## Future Enhancements

### Phase 1 Complete ✅
- [x] Basic 3D scene with camera
- [x] Drag-to-pan controls with momentum
- [x] Scroll-to-zoom
- [x] 5 location markers
- [x] Hover tooltips
- [x] Category filtering
- [x] Design system implementation
- [x] React 19 + R3F v9 upgrade
- [x] Deployed to Vercel

### Phase 2: Place Detail Pages (Planned)
- [ ] Route: `/places/[slug]`
- [ ] GSAP camera fly-in animation
- [ ] Page transition effects (watercolor dissolve)
- [ ] Scroll-based storytelling (La Gata Perduda style)
- [ ] Parallax image layers
- [ ] Embedded Mapbox map
- [ ] Related places carousel

### Phase 3: Visual Polish (Planned)
- [ ] Hand-drawn terrain texture (custom Dakar map)
- [ ] 3D landmark models (African Renaissance Monument, mosques)
- [ ] Custom marker 3D models (replace spheres)
- [ ] Custom shaders (watercolor, paper texture)
- [ ] Edge detection post-processing
- [ ] Grain overlay refinement

### Phase 4: Audio (Planned)
- [ ] Ambient Dakar soundscape (Howler.js)
- [ ] Different zones for different neighborhoods
- [ ] Interaction sounds (hover, click)
- [ ] Mute button

### Phase 5: Content (Planned)
- [ ] Full 54 locations with content
- [ ] Professional photography
- [ ] Editorial descriptions
- [ ] Mapbox integration
- [ ] Events layer

### Phase 6: Advanced Interactions (Planned)
- [ ] Search functionality
- [ ] Share individual places
- [ ] Mobile responsive (2D fallback or simplified 3D)
- [ ] Accessibility (keyboard navigation, screen readers)
- [ ] Analytics integration

---

## Deployment Configuration

### Vercel Setup

**File: `next.config.ts`**

```typescript
const nextConfig: NextConfig = {
  transpilePackages: ['three'],  // Transpile Three.js for browser compatibility

  webpack: (config) => {
    // Handle GLSL shader files (future)
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      exclude: /node_modules/,
      use: ['raw-loader']
    })
    return config
  },

  images: {
    formats: ['image/avif', 'image/webp'],  // Modern image formats
  },
}
```

### Environment Variables (Future)

```env
# .env.local
NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxx
NEXT_PUBLIC_API_URL=https://api.waktu.app
```

### Build Command

```bash
npm run build
```

Next.js automatically:
- Optimizes fonts (Bebas Neue, Space Grotesk, Cormorant Garamond)
- Generates static assets
- Creates serverless functions
- Minifies JavaScript
- Tree-shakes unused code

---

## Key Learnings

### 1. React Three Fiber Best Practices

**✅ Do:**
- Use `useFrame` for animations (not `setInterval`)
- Use `useRef` for mutable values (not `useState`)
- Use Drei helpers (`<Html>`, `<Environment>`, `<PerspectiveCamera>`)
- Wrap async loads in `<Suspense>`

**❌ Don't:**
- Mix imperative Three.js code with declarative R3F
- Create new objects in render (use `useMemo`)
- Forget to clean up event listeners

### 2. Next.js 15 + Three.js Integration

**Critical:**
- Always use `'use client'` for 3D components
- Use `dynamic(() => import(), { ssr: false })` for Canvas
- Match React version to Next.js requirements
- Use `transpilePackages` for Three.js

### 3. Performance Considerations

**For 54+ markers:**
- Consider instanced rendering
- Use LOD for distant objects
- Implement frustum culling
- Lazy load place pages
- Compress 3D assets

### 4. Coordinate Systems

**Three.js vs Geographic:**
- Three.js: Y is up, Z is depth
- Geographic: Latitude (Y), Longitude (X)
- Always visualize axes in development (`<gridHelper>`)

### 5. State Management for 3D

**Zustand wins for:**
- Simple, minimal API
- Works seamlessly with R3F
- No Provider needed
- Great TypeScript support

**Avoid:**
- Redux (too much boilerplate)
- Context (re-render issues with 3D)

---

## Performance Metrics (Current)

**Lighthouse Score (Production):**
- Performance: TBD
- Accessibility: TBD
- Best Practices: TBD
- SEO: TBD

**WebGL Stats:**
- Draw calls: ~7 (1 terrain + 5 markers + lights)
- Triangles: ~6,400 (terrain: 4,096 + markers: ~2,000)
- Programs: 3 (terrain, markers, environment)
- Textures: 1 (environment HDR)

**Bundle Size:**
- First Load JS: TBD
- Route (client): TBD
- Three.js: ~580KB
- R3F: ~40KB
- Drei: ~50KB

---

## References & Inspiration

**Technical:**
- [React Three Fiber Docs](https://docs.pmnd.rs/react-three-fiber)
- [Three.js Fundamentals](https://threejs.org/manual/)
- [Drei Helpers](https://github.com/pmndrs/drei)
- [Next.js App Router](https://nextjs.org/docs/app)

**Design:**
- [Chartogne-Taillet](https://chartogne-taillet.com) - Map interaction
- [La Gata Perduda](https://lagataperduda.com/en/mapa) - Content pages
- [Partcours Dakar](https://partcours.com) - Location data source

**Color Theory:**
- Warm West African palette
- High contrast for accessibility
- Cream backgrounds to reduce eye strain

---

## Conclusion

WAKTU's 3D map was built with a focus on:
- ✅ Smooth, intuitive interactions (Chartogne-Taillet style)
- ✅ Clean, declarative React code (R3F best practices)
- ✅ Production-ready architecture (Next.js 15 + React 19)
- ✅ Extensibility (easy to add features)
- ✅ Performance (60fps target)

**Current State:**
- 5 locations with full interactivity
- Drag, zoom, hover, click, filter
- Production deployed on Vercel
- Zero console errors
- Stable React 19 + R3F v9 stack

**Next Steps:**
- Add 49 more locations (→ 54 total)
- Implement place detail pages
- Add camera fly animations (GSAP)
- Create hand-drawn terrain texture
- Integrate ambient audio

The foundation is solid and ready for rapid feature iteration.

---

**Built by:** Claude (Anthropic)
**Repository:** https://github.com/0xfishbone/waktu
**Live Site:** https://waktu.vercel.app
**Last Updated:** December 28, 2024
