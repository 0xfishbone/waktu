export type PlaceCategory = 'gallery' | 'museum' | 'cultural-center' | 'studio' | 'landmark'

export interface Place {
  id: string
  slug: string
  name: string
  category: PlaceCategory
  neighborhood: string
  address?: string
  coordinates: [number, number] // [lng, lat] format for MapTiler
  tagline: string
  description?: string
  heroImage?: string
  gallery?: string[]
  hours?: string
  entry?: string
  website?: string
  phone?: string
  featured?: boolean
  tags?: string[]
}
