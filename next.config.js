/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      'm.media-amazon.com',
      'images-na.ssl-images-amazon.com',
      'via.placeholder.com',
      'placehold.co',
      'picsum.photos',
      'gagdrneksilycmcewyvt.supabase.co'
    ],
  },
}

module.exports = nextConfig