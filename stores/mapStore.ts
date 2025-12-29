import { create } from 'zustand';
import { ArtSpace } from '@/data/places';

interface MapStore {
  selectedPlace: ArtSpace | null;
  hoveredPlace: ArtSpace | null;
  filterCategory: string | null;
  setSelectedPlace: (place: ArtSpace | null) => void;
  setHoveredPlace: (place: ArtSpace | null) => void;
  setFilterCategory: (category: string | null) => void;
}

export const useMapStore = create<MapStore>((set) => ({
  selectedPlace: null,
  hoveredPlace: null,
  filterCategory: null,
  setSelectedPlace: (place) => set({ selectedPlace: place }),
  setHoveredPlace: (place) => set({ hoveredPlace: place }),
  setFilterCategory: (category) => set({ filterCategory: category }),
}));
