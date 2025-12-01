import { createClient, createAdminClient } from './server'
import { Database } from './types'
import { sb } from '../supabase-utils'

// Product queries
export async function getProducts(limit = 20, offset = 0) {
  const supabase = await createClient()

  // Select only necessary fields for better performance
  let query = supabase
    .from('products_with_taxonomy')
    .select(`
      id,
      name,
      slug,
      brand_name,
      category_name,
      category_id,
      country_of_origin,
      featured_image_url,
      bifl_total_score,
      bifl_certification,
      price,
      status,
      is_featured,
      use_case,
      excerpt,
      durability_score,
      repairability_score,
      warranty_score,
      sustainability_score,
      social_score,
      created_at
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

  return data
}


export async function getFeaturedProducts() {
  const supabase = await createClient()

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
  const supabase = await createClient()

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
  const supabase = await createClient()

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
  const supabase = await createClient()

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

// Get main categories only (parent_id IS NULL)
export async function getCategories(): Promise<Database['public']['Tables']['categories']['Row'][]> {
  const supabase = await createClient()

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
  const supabase = await createClient()

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

// Get subcategories for a specific parent category
export async function getSubcategories(parentId: string): Promise<Database['public']['Tables']['categories']['Row'][]> {
  const supabase = await createClient()

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
  const supabase = await createClient()

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

// Get similar products based on category and exclude current product
export async function getSimilarProducts(productId: string, categoryId?: string, limit = 8) {
  const supabase = await createClient()

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
  const supabase = await createClient()

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
  const { data: existingProduct, error: checkError } = await adminClient
    .from('products')
    .select('id, name, is_featured')
    .eq('id', productId)
    .single()

  if (checkError) {
    console.error('Product not found:', checkError)
    throw new Error(`Product with ID ${productId} not found`)
  }


  // Update using admin client with full permissions
  const { data, error, count } = await sb.update(adminClient, 'products', { is_featured: isFeatured })
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
  const supabase = await createClient()

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
  const supabase = await createClient()

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

// Buying guide queries
export async function getPublishedGuides(limit = 6) {
  const supabase = await createClient()

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