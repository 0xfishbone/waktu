import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Transpile React Three packages to use our React version
  // This prevents duplicate React instances without breaking Server Components
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],

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
