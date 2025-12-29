'use client';

import dynamic from 'next/dynamic';
import Logo from '@/components/ui/Logo';
import FilterButtons from '@/components/ui/FilterButtons';

// Dynamically import Map to avoid SSR issues with MapLibre
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-waktu-cream flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-bebas text-8xl text-waktu-indigo tracking-wider mb-4">
          WAKTU
        </h1>
        <p className="font-space text-xl text-waktu-brown">
          Dakar&apos;s Art & Culture Map
        </p>
        <p className="font-cormorant text-lg text-waktu-faded-indigo mt-2 italic">
          Loading experience...
        </p>
      </div>
    </div>
  ),
});

export default function Home() {
  return (
    <main className="w-full h-screen bg-waktu-cream relative overflow-hidden">
      {/* MapLibre 3D Map */}
      <Map />

      {/* UI Overlays */}
      <Logo />
      <FilterButtons />
    </main>
  );
}
