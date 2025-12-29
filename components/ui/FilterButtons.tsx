'use client';

import { useMapStore } from '@/stores/mapStore';

const categories = [
  { id: null, label: 'All' },
  { id: 'gallery', label: 'Galleries' },
  { id: 'museum', label: 'Museums' },
  { id: 'cultural-center', label: 'Cultural Centers' },
  { id: 'studio', label: 'Studios' },
  { id: 'landmark', label: 'Landmarks' },
];

export default function FilterButtons() {
  const { filterCategory, setFilterCategory } = useMapStore();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-waktu-cream/80 backdrop-blur-md rounded-full px-4 py-3 shadow-lg">
        <div className="flex gap-2">
          {categories.map((category) => (
            <button
              key={category.label}
              onClick={() => setFilterCategory(category.id)}
              className={`
                px-4 py-2 rounded-full font-space text-sm transition-all
                ${
                  filterCategory === category.id
                    ? 'bg-waktu-terracotta text-waktu-cream'
                    : 'bg-waktu-sand text-waktu-brown hover:bg-waktu-ochre hover:text-waktu-cream'
                }
              `}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
