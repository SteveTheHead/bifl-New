import { createClient } from './server'
import { Database } from './types'

type Product = Database['public']['Tables']['products']['Row']
type ProductWithTaxonomy = Database['public']['Views']['products_with_taxonomy']['Row']
type Brand = Database['public']['Tables']['brands']['Row']
type Category = Database['public']['Tables']['categories']['Row']
type Material = Database['public']['Tables']['materials']['Row']
type PriceRange = Database['public']['Tables']['price_ranges']['Row']

// Product queries
export async function getProducts(limit = 20, offset = 0) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products_with_taxonomy')
    .select('*')
    .eq('status', 'published')
    .order('bifl_total_score', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching products:', error)
    throw error
  }

  return data
}

export async function getFeaturedProducts() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('featured_products')
    .select('*')
    .limit(8)

  if (error) {
    console.error('Error fetching featured products:', error)
    throw error
  }

  return data
}

export async function getProductById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products_with_taxonomy')
    .select('*')
    .eq('id', id)
    .eq('status', 'published')
    .single()

  if (error) {
    console.error('Error fetching product by ID:', error)
    throw error
  }

  return data
}

export async function getProductBySlug(slug: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      brands!brand_id(name, slug, website, description),
      categories!category_id(name, slug, description),
      materials!primary_material_id(name, slug, description),
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
  const supabase = await createClient()

  let query = supabase
    .from('products_with_taxonomy')
    .select('*')

  // Search term
  if (searchTerm) {
    query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,brand_name.ilike.%${searchTerm}%`)
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
  const supabase = await createClient()

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

export async function getCategories() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
    throw error
  }

  return data
}

export async function getMaterials() {
  const supabase = await createClient()

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
  const supabase = await createClient()

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
  const supabase = await createClient()

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

// Client-side queries for mutations
export async function addReview(review: Database['public']['Tables']['reviews']['Insert']) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('reviews')
    .insert(review)
    .select()
    .single()

  if (error) {
    console.error('Error adding review:', error)
    throw error
  }

  return data
}