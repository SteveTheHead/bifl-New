import { unstable_cache } from 'next/cache'
import { createBuildClient, createAdminClient } from './server'
import { Database } from './types'
import { sb } from '../supabase-utils'
import { calculateBadges } from '../scoring'

/**
 * Grid-subset row returned by getProducts(). View columns are all nullable in
 * the generated types (Postgres drops NOT NULL through views), but id/name/slug
 * come straight from products' NOT NULL columns, so we assert them non-null here
 * at the single query boundary instead of null-guarding every consumer.
 */
export type ProductGridRow = {
  id: string
  name: string
  slug: string
  brand_name: string | null
  category_name: string | null
  category_id: string | null
  featured_image_url: string | null
  bifl_total_score: number | null
  bifl_certification: string | null
  price: number | null
  durability_score: number | null
  repairability_score: number | null
  warranty_score: number | null
  sustainability_score: number | null
  social_score: number | null
}

// Product queries
export async function getProducts(limit = 20, offset = 0): Promise<ProductGridRow[]> {
  const supabase = createBuildClient()

  // Select only fields needed for product grid display
  // Minimized payload for better performance and smaller HTML size
  let query = supabase
    .from('products_with_taxonomy')
    .select(`
      id,
      name,
      slug,
      brand_name,
      category_name,
      category_id,
      featured_image_url,
      bifl_total_score,
      bifl_certification,
      price,
      durability_score,
      repairability_score,
      warranty_score,
      sustainability_score,
      social_score
    `)
    .eq('status', 'published')
    .order('bifl_total_score', { ascending: false })

  // Handle limit: 0 means get all (use high limit), otherwise use specified limit
  if (limit === 0) {
    // Use a very high limit to get all products (Supabase default max is usually 1000)
    query = query.limit(10000)
  } else {
    query = query.range(offset, offset + limit - 1)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching products:', error)
    throw error
  }

  return (data ?? []) as ProductGridRow[]
}

/** Strip PostgREST filter-grammar characters from user input before it is
 *  interpolated into an .or() string (audit M9 — filter injection). */
function escapeFilterValue(value: string): string {
  return value.replace(/[,()%\\]/g, ' ').trim()
}

/**
 * SQL-side equivalents of the badge criteria in lib/scoring.ts calculateBadges.
 * A product matches a badge if its stored bifl_certification mentions it OR its
 * subscores meet the published rule (the fallback the grid used client-side).
 */
const BADGE_SQL: Record<string, string> = {
  'Gold Standard':
    'and(bifl_total_score.gte.9,durability_score.gte.8.5,warranty_score.gte.8)',
  'Lifetime Warranty': 'warranty_score.gte.10',
  'Crowd Favorite': 'social_score.gte.8.5',
  'Repair Friendly': 'repairability_score.gte.8.5',
  'Eco Hero': 'sustainability_score.gte.8',
  'BIFL Approved':
    'and(bifl_total_score.gte.7.5,durability_score.gte.7,warranty_score.gte.6)',
}

export interface ProductFilterParams {
  search?: string
  /** Category ids to match; pass subcategory ids explicitly (no recursion here). */
  categoryIds?: string[]
  badges?: string[]
  brands?: string[]
  countries?: string[]
  scoreRanges?: string[] // '9.0-10' | '8.0-8.9' | '7.0-7.9' | '6.0-6.9' | '0.0-5.9'
  priceMin?: number
  priceMax?: number
  sort?: 'score-desc' | 'score-asc' | 'name-asc' | 'name-desc' | 'newest'
  page?: number
  pageSize?: number
}

export interface FilteredProducts {
  products: ProductGridRow[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * Server-side filtered + paginated product listing for /products (audit M6).
 * One page of rows and an exact count instead of shipping the whole catalog
 * to the client.
 */
export async function getProductsFiltered(
  params: ProductFilterParams = {}
): Promise<FilteredProducts> {
  const supabase = createBuildClient()
  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.min(96, Math.max(1, params.pageSize ?? 24))

  let query = supabase
    .from('products_with_taxonomy')
    .select(
      `
      id,
      name,
      slug,
      brand_name,
      category_name,
      category_id,
      featured_image_url,
      bifl_total_score,
      bifl_certification,
      price,
      durability_score,
      repairability_score,
      warranty_score,
      sustainability_score,
      social_score
    `,
      { count: 'exact' }
    )
    .eq('status', 'published')

  // Search: every word must match name, brand, or use case (simple ilike;
  // relevance ordering is score-based below)
  if (params.search?.trim()) {
    for (const word of params.search.trim().split(/\s+/).slice(0, 6)) {
      const w = escapeFilterValue(word)
      if (!w) continue
      query = query.or(
        `name.ilike.*${w}*,brand_name.ilike.*${w}*,use_case.ilike.*${w}*`
      )
    }
  }

  if (params.categoryIds?.length) {
    query = query.in('category_id', params.categoryIds)
  }

  if (params.brands?.length) {
    query = query.in('brand_name', params.brands.map(escapeFilterValue))
  }

  if (params.countries?.length) {
    query = query.in('country_of_origin', params.countries.map(escapeFilterValue))
  }

  if (params.badges?.length) {
    const clauses = params.badges
      .filter((b) => BADGE_SQL[b])
      .map((b) => `bifl_certification.ilike.*${b}*,${BADGE_SQL[b]}`)
    if (clauses.length) query = query.or(clauses.join(','))
  }

  if (params.scoreRanges?.length) {
    const ranges: Record<string, string> = {
      '9.0-10': 'and(bifl_total_score.gte.9,bifl_total_score.lte.10)',
      '8.0-8.9': 'and(bifl_total_score.gte.8,bifl_total_score.lt.9)',
      '7.0-7.9': 'and(bifl_total_score.gte.7,bifl_total_score.lt.8)',
      '6.0-6.9': 'and(bifl_total_score.gte.6,bifl_total_score.lt.7)',
      '0.0-5.9': 'and(bifl_total_score.gte.0,bifl_total_score.lt.6)',
    }
    const clauses = params.scoreRanges.filter((r) => ranges[r]).map((r) => ranges[r])
    if (clauses.length) query = query.or(clauses.join(','))
  }

  // Price: products with no/zero price stay visible (matches the old client
  // behavior — missing data shouldn't hide a product)
  if (params.priceMin != null || params.priceMax != null) {
    const min = params.priceMin ?? 0
    const max = params.priceMax ?? 1_000_000
    query = query.or(`and(price.gte.${min},price.lte.${max}),price.is.null,price.eq.0`)
  }

  switch (params.sort) {
    case 'score-asc':
      query = query.order('bifl_total_score', { ascending: true, nullsFirst: true })
      break
    case 'name-asc':
      query = query.order('name', { ascending: true })
      break
    case 'name-desc':
      query = query.order('name', { ascending: false })
      break
    case 'newest':
      query = query.order('created_at', { ascending: false })
      break
    default:
      query = query.order('bifl_total_score', { ascending: false })
  }

  const from = (page - 1) * pageSize
  const { data, error, count } = await query.range(from, from + pageSize - 1)

  if (error) {
    console.error('Error fetching filtered products:', error)
    throw error
  }

  const total = count ?? 0
  return {
    products: (data ?? []) as ProductGridRow[],
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  }
}

export interface ProductFacets {
  /** brand name -> product count, sorted by name */
  brands: { name: string; count: number }[]
  /** country -> product count, sorted by name */
  countries: { name: string; count: number }[]
  /** badge name -> product count (stored certification OR computed rule) */
  badgeCounts: Record<string, number>
  /** direct (non-rolled-up) product count per category id */
  categoryCounts: Record<string, number>
  priceRange: [number, number]
  total: number
}

/** Filter-sidebar options + counts, one light query over the published
 *  catalog instead of shipping every product to the client. */
export async function getProductFacets(): Promise<ProductFacets> {
  const supabase = createBuildClient()
  const { data, error } = await supabase
    .from('products_with_taxonomy')
    .select(
      'brand_name, country_of_origin, price, category_id, bifl_certification, bifl_total_score, durability_score, repairability_score, warranty_score, sustainability_score, social_score'
    )
    .eq('status', 'published')
    .limit(10000)

  if (error) {
    console.error('Error fetching product facets:', error)
    throw error
  }

  const brandMap = new Map<string, number>()
  const countryMap = new Map<string, number>()
  const badgeCounts: Record<string, number> = {}
  const categoryCounts: Record<string, number> = {}
  let min = Infinity
  let max = 0

  for (const row of data ?? []) {
    if (row.brand_name?.trim()) {
      const b = row.brand_name.trim()
      brandMap.set(b, (brandMap.get(b) ?? 0) + 1)
    }
    if (row.country_of_origin?.trim()) {
      const c = row.country_of_origin.trim()
      countryMap.set(c, (countryMap.get(c) ?? 0) + 1)
    }
    if (row.category_id) {
      categoryCounts[row.category_id] = (categoryCounts[row.category_id] ?? 0) + 1
    }
    const badges = row.bifl_certification || calculateBadges(row)
    for (const badge of [
      'Gold Standard',
      'Lifetime Warranty',
      'Crowd Favorite',
      'BIFL Approved',
      'Repair Friendly',
      'Eco Hero',
    ]) {
      if (badges.includes(badge)) badgeCounts[badge] = (badgeCounts[badge] ?? 0) + 1
    }
    const price = typeof row.price === 'number' ? row.price : parseFloat(row.price ?? '')
    if (!isNaN(price) && price > 0) {
      min = Math.min(min, price)
      max = Math.max(max, price)
    }
  }

  const toSorted = (m: Map<string, number>) =>
    [...m.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name))

  return {
    brands: toSorted(brandMap),
    countries: toSorted(countryMap),
    badgeCounts,
    categoryCounts,
    priceRange: min === Infinity ? [0, 10000] : [Math.floor(min), Math.ceil(max)],
    total: data?.length ?? 0,
  }
}

/**
 * Cached wrappers for /products. Reading searchParams makes the route
 * render dynamically, so these keep the underlying Supabase reads on a
 * 30-minute data cache (unstable_cache keys include the arguments, so each
 * filter combination caches separately).
 */
export const getProductFacetsCached = unstable_cache(getProductFacets, ['product-facets'], {
  revalidate: 1800,
})

export const getProductsFilteredCached = unstable_cache(
  getProductsFiltered,
  ['products-filtered'],
  { revalidate: 1800 }
)


export async function getFeaturedProducts() {
  const supabase = createBuildClient()

  const { data, error } = await supabase
    .from('products_with_taxonomy')
    .select(`
      *,
      bifl_certification,
      durability_score,
      repairability_score,
      warranty_score,
      sustainability_score,
      social_score
    `)
    .eq('status', 'published')
    .eq('is_featured', true)
    .order('bifl_total_score', { ascending: false })
    .limit(8)

  if (error) {
    console.error('Error fetching featured products:', error)
    throw error
  }

  return data
}

export async function getProductById(id: string) {
  const supabase = createBuildClient()

  // Validate the ID parameter
  if (!id || typeof id !== 'string') {
    console.error('Invalid product ID provided:', id)
    return null
  }

  try {
    // Check if ID looks like a UUID, if not, try as slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

    let query = supabase
      .from('products')
      .select(`
        *,
        brands!brand_id(name, slug, website, description),
        categories!category_id(name, slug, description)
      `)
      .eq('status', 'published')

    // Use id or slug based on format
    if (isUUID) {
      query = query.eq('id', id)
    } else {
      query = query.eq('slug', id)
    }

    const { data, error } = await query.single()

    if (error) {
      // Only log errors that aren't "not found" (PGRST116 is expected when product doesn't exist)
      if (error.code !== 'PGRST116') {
        console.error('Error fetching product:',
          `ID/Slug: ${id}, `,
          `Code: ${error.code}, `,
          `Message: ${error.message}, `,
          `Details: ${JSON.stringify(error.details)}`
        )
      }
      return null
    }

    return data
  } catch (err: any) {
    console.error('Unexpected error in getProductById:',
      `ID: ${id}, `,
      `Error: ${err?.message || String(err)}`
    )
    return null
  }
}

export async function getProductBySlug(slug: string) {
  const supabase = createBuildClient()

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      brands!brand_id(name, slug, website, description),
      categories!category_id(name, slug, description),
      materials!products_primary_material_id_fkey(name, slug, description),
      price_ranges!price_range_id(name, min_price, max_price)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error) {
    console.error('Error fetching product:', error)
    throw error
  }

  return data
}

export async function searchProducts(
  searchTerm: string,
  filters: {
    categoryId?: string
    brandId?: string
    priceRangeId?: string
    minScore?: number
  } = {},
  sortBy = 'bifl_total_score',
  limit = 20,
  offset = 0
) {
  const supabase = createBuildClient()

  let query = supabase
    .from('products_with_taxonomy')
    .select('*')
    .eq('status', 'published')

  // Search term - improved to handle multi-word searches and include use cases
  if (searchTerm) {
    const words = searchTerm.trim().split(/\s+/)

    if (words.length === 1) {
      // Single word search
      const word = words[0]
      query = query.or(`name.ilike.%${word}%,description.ilike.%${word}%,brand_name.ilike.%${word}%,use_case.ilike.%${word}%`)
    } else {
      // Multi-word search - find products containing ANY of the words
      const orConditions = words.map(word =>
        `name.ilike.%${word}%,description.ilike.%${word}%,brand_name.ilike.%${word}%,use_case.ilike.%${word}%`
      ).join(',')
      query = query.or(orConditions)
    }
  }

  // Filters
  if (filters.categoryId) {
    query = query.eq('category_id', filters.categoryId)
  }
  if (filters.brandId) {
    query = query.eq('brand_id', filters.brandId)
  }
  if (filters.priceRangeId) {
    query = query.eq('price_range_id', filters.priceRangeId)
  }
  if (filters.minScore) {
    query = query.gte('bifl_total_score', filters.minScore)
  }

  // Sorting
  const isAscending = sortBy.includes('-asc')
  const sortField = sortBy.replace('-asc', '').replace('-desc', '')
  query = query.order(sortField, { ascending: isAscending })

  // Pagination
  query = query.range(offset, offset + limit - 1)

  const { data, error } = await query

  if (error) {
    console.error('Error searching products:', error)
    throw error
  }

  return data
}

// Taxonomy queries
export async function getBrands() {
  const supabase = createBuildClient()

  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching brands:', error)
    throw error
  }

  return data
}

// Get main categories only (parent_id IS NULL)
export async function getCategories(): Promise<Database['public']['Tables']['categories']['Row'][]> {
  const supabase = createBuildClient()

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .is('parent_id', null)
    .not('name', 'is', null)
    .neq('name', '')
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
    throw error
  }

  return data || []
}

// Get all categories (main and subcategories)
export async function getAllCategories(): Promise<Database['public']['Tables']['categories']['Row'][]> {
  const supabase = createBuildClient()

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .not('name', 'is', null)
    .neq('name', '')
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching all categories:', error)
    throw error
  }

  return data || []
}

/** Cached category lists for dynamically-rendered routes (see the
 *  getProductsFilteredCached comment). */
export const getCategoriesCached = unstable_cache(getCategories, ['categories-main'], {
  revalidate: 1800,
})
export const getAllCategoriesCached = unstable_cache(getAllCategories, ['categories-all'], {
  revalidate: 1800,
})

// Get subcategories for a specific parent category
export async function getSubcategories(parentId: string): Promise<Database['public']['Tables']['categories']['Row'][]> {
  const supabase = createBuildClient()

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('parent_id', parentId)
    .not('name', 'is', null)
    .neq('name', '')
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching subcategories:', error)
    throw error
  }

  return data || []
}

export async function getCategoriesWithProductCounts() {
  const supabase = createBuildClient()

  // First get all categories
  const categories = await getCategories()

  // Then get product counts for each category
  const categoriesWithCounts = await Promise.all(
    categories.map(async (category) => {
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', category.id)
        .eq('status', 'published')

      if (error) {
        console.error(`Error counting products for category ${category.id}:`, error)
        return { ...category, product_count: 0 }
      }

      return { ...category, product_count: count || 0 }
    })
  )

  return categoriesWithCounts
}

export async function getMaterials() {
  const supabase = createBuildClient()

  const { data, error } = await supabase
    .from('materials')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching materials:', error)
    throw error
  }

  return data
}

export async function getPriceRanges() {
  const supabase = createBuildClient()

  const { data, error } = await supabase
    .from('price_ranges')
    .select('*')
    .order('display_order')

  if (error) {
    console.error('Error fetching price ranges:', error)
    throw error
  }

  return data
}

// Review queries
export async function getProductReviews(productId: string) {
  const supabase = createBuildClient()

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching reviews:', error)
    throw error
  }

  return data
}

// Get similar products based on category and exclude current product
export async function getSimilarProducts(productId: string, categoryId?: string, limit = 8) {
  const supabase = createBuildClient()

  let query = supabase
    .from('products_with_taxonomy')
    .select('*')
    .eq('status', 'published')
    .neq('id', productId) // Exclude current product

  // If we have a category, prioritize products from the same category
  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  const { data, error } = await query
    .order('bifl_total_score', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching similar products:', error)
    return []
  }

  // If we don't have enough products from the same category, get more from any category
  if (data && data.length < limit) {
    const remainingLimit = limit - data.length
    const { data: additionalData, error: additionalError } = await supabase
      .from('products_with_taxonomy')
      .select('*')
      .eq('status', 'published')
      .neq('id', productId)
      .not('id', 'in', `(${(data as any[]).map((p: any) => p.id).join(',')})`)
      .order('bifl_total_score', { ascending: false })
      .limit(remainingLimit)

    if (!additionalError && additionalData) {
      data.push(...additionalData)
    }
  }

  return data || []
}

// Client-side queries for mutations
export async function addReview(review: Database['public']['Tables']['reviews']['Insert']) {
  const supabase = createBuildClient()

  const { data, error } = await sb.insert(supabase, 'reviews', [review])

  if (error) {
    console.error('Error adding review:', error)
    throw error
  }

  return data
}

// Admin functions for managing featured products
export async function toggleProductFeatured(productId: string, isFeatured: boolean) {

  // Use admin client to bypass RLS policies
  const adminClient = createAdminClient()

  // First check if the product exists
  const { error: checkError } = await adminClient
    .from('products')
    .select('id, name, is_featured')
    .eq('id', productId)
    .single()

  if (checkError) {
    console.error('Product not found:', checkError)
    throw new Error(`Product with ID ${productId} not found`)
  }


  // Update using admin client with full permissions
  const { data, error } = await sb.update(adminClient, 'products', { is_featured: isFeatured })
    .eq('id', productId)
    .select()


  if (error) {
    console.error('Error updating featured status:', error)
    throw error
  }

  if (!data || data.length === 0) {
    throw new Error('Update succeeded but no data returned')
  }

  return data[0]
}

export async function getAllProductsForAdmin() {
  const supabase = createBuildClient()

  const { data, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      slug,
      brand_id,
      brands!brand_id(name),
      category_id,
      categories!category_id(name),
      bifl_total_score,
      featured_image_url,
      is_featured,
      status,
      created_at,
      use_case,
      price
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products for admin:', error)
    throw error
  }

  // Transform the response to match the expected format
  return data?.map(product => ({
    ...(product as any),
    brand_name: ((product as any).brands as any)?.name || 'Unknown Brand',
    category_name: ((product as any).categories as any)?.name || 'Uncategorized'
  })) || []
}

// Curation queries
export async function getFeaturedCurations() {
  const supabase = createBuildClient()

  const { data, error } = await supabase
    .from('curations')
    .select(`
      id,
      name,
      slug,
      description,
      featured_image_url,
      display_order,
      curation_products!inner (
        id,
        product_id,
        display_order
      )
    `)
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('display_order', { ascending: true })
    .limit(6)

  if (error) {
    // Silently return empty array - curations feature may not be set up yet
    return []
  }

  // Add product count to each curation
  return data?.map((curation: any) => ({
    ...curation,
    product_count: curation.curation_products?.length || 0
  })) || []
}

/**
 * Live site stats for copy/metadata (audit M14 — no more hardcoded "327+").
 * Cached daily; roundedProducts gives a stable marketing-friendly floor
 * ("354 products" -> "350+").
 */
export const getSiteStats = unstable_cache(
  async () => {
    const supabase = createBuildClient()
    const [{ count: productCount }, { count: categoryCount }] = await Promise.all([
      supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published'),
      supabase.from('categories').select('*', { count: 'exact', head: true }),
    ])
    const products = productCount ?? 0
    return {
      products,
      categories: categoryCount ?? 0,
      roundedProducts: `${Math.max(10, Math.floor(products / 10) * 10)}+`,
    }
  },
  ['site-stats'],
  { revalidate: 86400 }
)

/** All active curations for the /curations index page. */
export async function getActiveCurations() {
  const supabase = createBuildClient()

  const { data, error } = await supabase
    .from('curations')
    .select(`
      id,
      name,
      slug,
      description,
      featured_image_url,
      display_order,
      curation_products (id)
    `)
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching curations:', error)
    return []
  }

  return (data ?? []).map((curation: any) => ({
    ...curation,
    product_count: curation.curation_products?.length || 0,
  }))
}

// Buying guide queries
export async function getPublishedGuides(limit = 6) {
  const supabase = createBuildClient()

  const { data, error } = await supabase
    .from('buying_guides')
    .select(`
      id,
      slug,
      title,
      meta_description,
      featured_image_url,
      published_at,
      categories (name, slug)
    `)
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching guides:', error)
    return []
  }

  return data || []
}