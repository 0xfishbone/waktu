export interface ArtSpace {
  id: string;
  slug: string;
  name: string;
  category: 'gallery' | 'museum' | 'cultural-center' | 'studio' | 'landmark';
  neighborhood: string;
  address?: string;
  coordinates: [number, number]; // [lng, lat]
  tagline: string;
  description: string;
  hours: string;
  entry: string;
  website?: string;
  featured: boolean;
  tags: string[];
}

export const artSpaces: ArtSpace[] = [
  {
    id: "raw-material",
    slug: "raw-material-company",
    name: "RAW Material Company",
    category: "cultural-center",
    neighborhood: "Zone B",
    address: "Sicap Liberté 1, Villa 5012",
    coordinates: [-17.4677, 14.7167],
    tagline: "Center for art, knowledge and society",
    description: "The most serious contemporary art discourse in Dakar happens here. Expect challenging exhibitions, critical programming, and the occasional mind-expanding talk. Founded by Koyo Kouoh, RAW has become a must-visit for anyone serious about African contemporary art.",
    hours: "Tue–Sat, 10h–18h",
    entry: "Free",
    website: "https://rawmaterialcompany.org",
    featured: true,
    tags: ["contemporary", "exhibitions", "talks", "residency"]
  },
  {
    id: "cecile-fakhoury",
    slug: "galerie-cecile-fakhoury",
    name: "Galerie Cécile Fakhoury",
    category: "gallery",
    neighborhood: "Plateau",
    address: "Rue AA 37, Angle Rue Carnot",
    coordinates: [-17.438, 14.669],
    tagline: "Contemporary African art at its finest",
    description: "One of West Africa's leading contemporary art galleries. Cécile Fakhoury's Dakar space showcases established and emerging artists from the continent and diaspora.",
    hours: "Mon–Fri, 9h–18h; Sat 10h–14h",
    entry: "Free",
    website: "https://cecilefakhoury.com",
    featured: true,
    tags: ["contemporary", "exhibitions"]
  },
  {
    id: "village-arts",
    slug: "village-des-arts",
    name: "Village des Arts",
    category: "studio",
    neighborhood: "Hann",
    address: "Route de l'Aéroport",
    coordinates: [-17.42, 14.735],
    tagline: "Dakar's creative heart",
    description: "A collective of over 50 artist studios and workshops in a vibrant, graffiti-covered compound. Come here to see artists at work and buy directly from studios.",
    hours: "Daily, 10h–19h (artists vary)",
    entry: "Free",
    featured: true,
    tags: ["studios", "painters", "sculptors"]
  },
  {
    id: "ifan-museum",
    slug: "musee-theodore-monod",
    name: "Musée Théodore Monod / IFAN",
    category: "museum",
    neighborhood: "Plateau",
    address: "Place Soweto",
    coordinates: [-17.435, 14.67],
    tagline: "West African heritage and art",
    description: "Senegal's premier museum of African art and culture. The IFAN Museum houses an extraordinary collection of masks, sculptures, textiles, and ethnographic objects from across West Africa.",
    hours: "Tue–Sun, 9h–18h",
    entry: "2000 CFA (students 1000 CFA)",
    website: "http://www.ifan.ucad.sn",
    featured: true,
    tags: ["traditional", "masks", "heritage"]
  },
  {
    id: "ker-thiossane",
    slug: "ker-thiossane",
    name: "Kër Thiossane",
    category: "cultural-center",
    neighborhood: "Sicap Liberté",
    address: "Villa 772, Sicap Liberté 1",
    coordinates: [-17.455, 14.725],
    tagline: "Digital art and new media",
    description: "Dakar's hub for digital art, new media, and tech-culture experimentation. Kër Thiossane has been pushing boundaries since the early 2000s.",
    hours: "Mon–Fri, 10h–18h",
    entry: "Free",
    website: "http://www.ker-thiossane.org",
    featured: false,
    tags: ["digital", "media", "technology"]
  },
  {
    id: "selebe-yoon",
    slug: "selebe-yoon",
    name: "Selebe Yoon",
    category: "gallery",
    neighborhood: "Fann",
    address: "Rue Paul Gérar, Fann Résidence",
    coordinates: [-17.462, 14.685],
    tagline: "Contemporary gallery space",
    description: "A contemporary art gallery showcasing cutting-edge work from African artists and the diaspora.",
    hours: "Tue–Sat, 10h–18h",
    entry: "Free",
    featured: false,
    tags: ["contemporary", "exhibitions"]
  },
  {
    id: "galerie-nationale",
    slug: "galerie-nationale-art",
    name: "Galerie Nationale d'Art",
    category: "museum",
    neighborhood: "Plateau",
    address: "Place de l'Indépendance",
    coordinates: [-17.437, 14.668],
    tagline: "National art gallery",
    description: "Senegal's national gallery showcasing modern and contemporary Senegalese art in a historic building.",
    hours: "Mon–Sat, 9h–17h",
    entry: "1000 CFA",
    featured: false,
    tags: ["national", "senegalese-art"]
  },
  {
    id: "oh-gallery",
    slug: "oh-gallery",
    name: "OH Gallery",
    category: "gallery",
    neighborhood: "Mamelles",
    address: "Almadies, Route des Mamelles",
    coordinates: [-17.489, 14.718],
    tagline: "Design-focused gallery",
    description: "A gallery space dedicated to contemporary design, photography, and art with a focus on African designers.",
    hours: "Mon–Sat, 10h–19h",
    entry: "Free",
    featured: false,
    tags: ["design", "photography"]
  },
  {
    id: "musee-boribana",
    slug: "musee-boribana",
    name: "Musée Boribana",
    category: "museum",
    neighborhood: "Parcelles Assainies",
    address: "Unité 25, Parcelles Assainies",
    coordinates: [-17.41, 14.76],
    tagline: "Private art museum",
    description: "A private museum housing a significant collection of contemporary African art in a beautifully designed space.",
    hours: "By appointment",
    entry: "2500 CFA",
    featured: false,
    tags: ["contemporary", "private-collection"]
  },
  {
    id: "monument-renaissance",
    slug: "monument-de-la-renaissance-africaine",
    name: "Monument de la Renaissance Africaine",
    category: "landmark",
    neighborhood: "Ouakam",
    coordinates: [-17.495, 14.722],
    tagline: "Africa's tallest statue",
    description: "A 49-meter bronze statue overlooking Dakar, celebrating African independence and renaissance. Controversial but iconic.",
    hours: "Daily, 9h–19h",
    entry: "5000 CFA",
    featured: true,
    tags: ["monument", "landmark", "viewpoint"]
  }
];

export const categoryColors: Record<string, string> = {
  'gallery': '#C4502A',
  'museum': '#4A5568',
  'cultural-center': '#D4A03E',
  'studio': '#2D1F14',
  'landmark': '#2B4F6C',
};
