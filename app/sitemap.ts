import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.buyitforlifeproducts.com'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/guides`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/how-it-works`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/scoring-methodology`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/what-is-buy-it-for-life`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/affiliate-disclosure`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // Get all published products
  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at')
    .eq('status', 'published')
    .order('updated_at', { ascending: false })

  const productPages: MetadataRoute.Sitemap = (products || []).map((product: any) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: new Date(product.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Get all categories
  const { data: categories } = await supabase
    .from('categories')
    .select('slug, updated_at')
    .order('updated_at', { ascending: false })

  const categoryPages: MetadataRoute.Sitemap = (categories || []).map((category: any) => ({
    url: `${baseUrl}/categories/${category.slug}`,
    lastModified: new Date(category.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Get all published buying guides
  const { data: guides } = await supabase
    .from('buying_guides')
    .select('slug, updated_at')
    .eq('is_published', true)
    .order('updated_at', { ascending: false })

  const guidePages: MetadataRoute.Sitemap = (guides || []).map((guide: any) => ({
    url: `${baseUrl}/guides/${guide.slug}`,
    lastModified: new Date(guide.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Get all active curations
  const { data: curations } = await supabase
    .from('curations')
    .select('slug, updated_at')
    .eq('is_active', true)
    .order('updated_at', { ascending: false })

  const curationPages: MetadataRoute.Sitemap = (curations || []).map((curation: any) => ({
    url: `${baseUrl}/curations/${curation.slug}`,
    lastModified: new Date(curation.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...productPages, ...categoryPages, ...guidePages, ...curationPages]
}
