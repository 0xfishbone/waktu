import type { Metadata } from 'next'
import { Bebas_Neue, Space_Grotesk, Cormorant_Garamond } from 'next/font/google'
import './globals.css'

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
  display: 'swap',
})

const cormorantGaramond = Cormorant_Garamond({
  weight: ['400'],
  style: ['italic'],
  subsets: ['latin'],
  variable: '--font-cormorant',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'WAKTU — Dakar\'s Art & Culture Map',
  description: 'Explore Dakar\'s galleries, museums, cultural centers, and artist studios through an immersive 3D map experience.',
  keywords: ['Dakar', 'art', 'culture', 'Senegal', 'galleries', 'museums', 'contemporary art', 'African art'],
  authors: [{ name: 'WAKTU' }],
  openGraph: {
    title: 'WAKTU — Dakar\'s Art & Culture Map',
    description: 'Explore Dakar\'s galleries, museums, cultural centers, and artist studios through an immersive 3D map experience.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WAKTU — Dakar\'s Art & Culture Map',
    description: 'Explore Dakar\'s art spaces through an immersive 3D map.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${spaceGrotesk.variable} ${cormorantGaramond.variable}`}>
      <body>
        {children}
      </body>
    </html>
  )
}
