'use client'

import dynamic from 'next/dynamic'
import Logo from '@/components/ui/Logo'
import FilterButtons from '@/components/ui/FilterButtons'

// Dynamically import Scene to avoid SSR issues with Three.js
const Scene = dynamic(() => import('@/components/map/Scene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-cream flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-display text-8xl text-deep-indigo tracking-wider mb-4">
          WAKTU
        </h1>
        <p className="font-body text-xl text-deep-brown">
          Dakar's Art & Culture Map
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
