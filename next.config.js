/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Quality gate ON: production builds fail on ESLint errors (real bugs).
    // `no-explicit-any` is downgraded to a warning in eslint.config.mjs, so
    // the pre-existing `any` debt doesn't block deploys while still being visible.
    ignoreDuringBuilds: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'images-na.ssl-images-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'gagdrneksilycmcewyvt.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.ft.com',
      },
      {
        protocol: 'https',
        hostname: '**.ft.com',
      },
    ],
  },
}

module.exports = nextConfig