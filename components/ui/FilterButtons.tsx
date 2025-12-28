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
