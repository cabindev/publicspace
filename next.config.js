/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'healthypublicspaces.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
  experimental: {
    optimizePackageImports: ['@supabase/supabase-js']
  },
}

module.exports = nextConfig