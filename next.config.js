/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Quality gate ON: production builds fail on ESLint errors (real bugs).
    // `no-explicit-any` is downgraded to a warning in eslint.config.mjs, so
    // the pre-existing `any` debt doesn't block deploys while still being visible.
    ignoreDuringBuilds: false,
  },
  images: {
    // Serve modern formats through the Vercel image optimizer
    formats: ['image/avif', 'image/webp'],
    // Product/category images change rarely; cache optimized variants 31 days
    minimumCacheTTL: 2678400,
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
        // Cloudflare R2 public bucket (admin image uploads)
        protocol: 'https',
        hostname: 'pub-6f0cf05705c7412b93a792350f3b3aa5.r2.dev',
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