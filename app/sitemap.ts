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
      url: `${baseUrl}/curations`,
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

  // Get all categories with their rolled-up published-product counts, and only
  // list the ones that are indexable (>= 3 products, matching the noindex
  // threshold in the category page's generateMetadata). Thin pages are
  // noindex, so they shouldn't appear in the sitemap.
  const MIN_INDEXABLE_PRODUCTS = 3
  const { data: categories } = await supabase
    .from('categories')
    .select('id, slug, parent_id, updated_at')
    .order('updated_at', { ascending: false })

  const { data: countRows } = await supabase
    .from('products')
    .select('category_id')
    .eq('status', 'published')

  const directCounts = new Map<string, number>()
  for (const row of countRows || []) {
    const id = (row as any).category_id
    if (id) directCounts.set(id, (directCounts.get(id) ?? 0) + 1)
  }
  const rollupCount = (cat: any) => {
    let n = directCounts.get(cat.id) ?? 0
    for (const child of categories || []) {
      if ((child as any).parent_id === cat.id) n += directCounts.get((child as any).id) ?? 0
    }
    return n
  }

  const categoryPages: MetadataRoute.Sitemap = (categories || [])
    .filter((category: any) => rollupCount(category) >= MIN_INDEXABLE_PRODUCTS)
    .map((category: any) => ({
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
