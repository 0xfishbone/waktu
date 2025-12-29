import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        waktu: {
          indigo: '#1A2B4A',
          cream: '#F5F1E8',
          terracotta: '#C4502A',
          ochre: '#D4A03E',
          sand: '#E8DFD0',
          brown: '#2D1F14',
          'faded-indigo': '#4A5568',
          atlantic: '#2B4F6C',
        },
      },
      fontFamily: {
        bebas: ['var(--font-bebas)', 'sans-serif'],
        space: ['var(--font-space)', 'sans-serif'],
        cormorant: ['var(--font-cormorant)', 'serif'],
      },
    },
  },
  plugins: [],
}

export default config
