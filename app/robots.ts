import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://buyitforlife.com'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/admin/',
        '/dashboard/',
        '/user-dashboard/',
        '/_next/',
        '/search?*', // Prevent indexing search result pages to avoid duplicate content
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
