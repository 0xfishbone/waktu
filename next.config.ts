import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Ensure single React instance for React Three Fiber
    // Use path.dirname to get the directory, allowing subpath imports like react/jsx-runtime
    const path = require('path')
    config.resolve.alias = {
      ...config.resolve.alias,
      'react': path.dirname(require.resolve('react/package.json')),
      'react-dom': path.dirname(require.resolve('react-dom/package.json')),
    }

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
