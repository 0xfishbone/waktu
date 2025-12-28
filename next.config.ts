import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Ensure single React instance for React Three Fiber
    // This prevents "Cannot read properties of undefined (reading 'ReactCurrentBatchConfig')" error
    config.resolve.alias = {
      ...config.resolve.alias,
      'react': require.resolve('react'),
      'react-dom': require.resolve('react-dom'),
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
