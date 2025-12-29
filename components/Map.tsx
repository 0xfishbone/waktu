'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { artSpaces, categoryColors } from '@/data/places';
import { useMapStore } from '@/stores/mapStore';

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY;

export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);

  const { setSelectedPlace, setHoveredPlace, filterCategory } = useMapStore();

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/aquarelle/style.json?key=${MAPTILER_KEY}`,
      center: [-17.4441, 14.6937], // Dakar
      zoom: 12,
      pitch: 50,
      bearing: -20,
      antialias: true,
    });

    map.current.on('load', () => {
      if (!map.current) return;

      // Add 3D terrain - MapLibre handles everything!
      map.current.addSource('terrain', {
        type: 'raster-dem',
        url: `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${MAPTILER_KEY}`,
        tileSize: 256,
      });

      map.current.setTerrain({ source: 'terrain', exaggeration: 1.5 });

      // Add markers for art spaces
      artSpaces.forEach((place) => {
        const el = document.createElement('div');
        el.className = 'marker';
        el.style.width = '24px';
        el.style.height = '24px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = categoryColors[place.category];
        el.style.border = '2px solid white';
        el.style.cursor = 'pointer';
        el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
        el.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';

        // Hover effects
        el.addEventListener('mouseenter', () => {
          el.style.transform = 'scale(1.3)';
          el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.5)';
          setHoveredPlace(place);
        });

        el.addEventListener('mouseleave', () => {
          el.style.transform = 'scale(1)';
          el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
          setHoveredPlace(null);
        });

        // Click to select and fly to
        el.addEventListener('click', () => {
          setSelectedPlace(place);
          map.current?.flyTo({
            center: place.coordinates,
            zoom: 15,
            pitch: 60,
            bearing: 0,
            duration: 2000,
            essential: true,
          });
        });

        // Create popup
        const popup = new maplibregl.Popup({
          offset: 25,
          closeButton: false,
          className: 'art-space-popup',
        }).setHTML(`
          <div style="font-family: var(--font-space), sans-serif; padding: 4px;">
            <h3 style="font-family: var(--font-bebas), sans-serif; font-size: 18px; margin: 0 0 4px 0; color: #2D1F14;">${place.name}</h3>
            <p style="font-size: 12px; margin: 0; color: #4A5568;">${place.neighborhood}</p>
          </div>
        `);

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat(place.coordinates)
          .setPopup(popup)
          .addTo(map.current!);

        markers.current.push(marker);
      });
    });

    return () => {
      markers.current.forEach(marker => marker.remove());
      markers.current = [];
      map.current?.remove();
    };
  }, [setSelectedPlace, setHoveredPlace]);

  // Filter markers based on category
  useEffect(() => {
    markers.current.forEach((marker, index) => {
      const place = artSpaces[index];
      const element = marker.getElement();

      if (filterCategory === null || place.category === filterCategory) {
        element.style.display = 'block';
      } else {
        element.style.display = 'none';
      }
    });
  }, [filterCategory]);

  return <div ref={mapContainer} className="w-full h-full" />;
}
