import { create } from 'zustand'
import type { Place } from '@/data/types'

interface MapState {
  selectedPlace: Place | null
  hoveredPlace: Place | null
  filterCategory: string | null
  isTransitioning: boolean
  isMuted: boolean
  setSelectedPlace: (place: Place | null) => void
  setHoveredPlace: (place: Place | null) => void
  setFilterCategory: (category: string | null) => void
  setIsTransitioning: (transitioning: boolean) => void
  toggleMute: () => void
}

export const useMapStore = create<MapState>((set) => ({
  selectedPlace: null,
  hoveredPlace: null,
  filterCategory: null,
  isTransitioning: false,
  isMuted: false,
  setSelectedPlace: (place) => set({ selectedPlace: place }),
  setHoveredPlace: (place) => set({ hoveredPlace: place }),
  setFilterCategory: (category) => set({ filterCategory: category }),
  setIsTransitioning: (transitioning) => set({ isTransitioning: transitioning }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
}))
