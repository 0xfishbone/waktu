import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Handle GLSL/shader files
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      exclude: /node_modules/,
      use: ['raw-loader']
    })
    return config
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
}

export default nextConfig
