/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Enable standalone output for Docker
  output: 'standalone',
  // Disable ESLint during builds (run separately)
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
