/**
 * Centralized Product Type Definitions
 *
 * This file contains all product-related type definitions to ensure consistency
 * across the application and prevent missing fields like slug.
 *
 * IMPORTANT: When creating product objects for components (especially AddToCompareButton,
 * ProductComparisonTable, etc.), always use these types to ensure all required fields
 * are included.
 */

/**
 * Base Product interface - includes all common product fields
 * Use this for most product displays, cards, grids, etc.
 */
export interface Product {
  id: string
  name: string
  slug: string  // REQUIRED for slug-based routing
  brand_name?: string
  price?: number | null
  featured_image_url?: string | null
  bifl_total_score?: number | null
  durability_score?: number | null
  repairability_score?: number | null
  warranty_score?: number | null
  sustainability_score?: number | null
  social_score?: number | null
  category_id?: string
  brand_id?: string
  affiliate_link?: string | null
  excerpt?: string | null
  created_at?: string
}

/**
 * Product for comparison features
 * Used by AddToCompareButton and ProductComparisonTable
 */
export interface ComparisonProduct {
  id: string
  name: string
  slug: string  // REQUIRED
  price: number
  images: string[]
  average_score?: number
  affiliate_link?: string | null
  // Additional fields for detailed comparison
  durability_score?: number
  repairability_score?: number
  warranty_score?: number
  sustainability_score?: number
  social_score?: number
  description?: string
}

/**
 * Minimal product for cards and lists
 * Use when you only need basic product info
 */
export interface MinimalProduct {
  id: string
  name: string
  slug: string  // REQUIRED
  brand_name?: string
  price?: number | null
  featured_image_url?: string | null
  bifl_total_score?: number | null
}

/**
 * Product with detailed information
 * Use for product detail pages
 */
export interface DetailedProduct extends Product {
  description?: string | null
  use_case?: string | null
  material?: string | null
  country_of_origin?: string | null
  warranty_info?: string | null
  care_instructions?: string | null
  is_featured?: boolean
  status?: string
  brands?: {
    name: string
    slug: string
    website?: string
    description?: string
  }
  categories?: {
    name: string
    slug: string
    description?: string
  }
}

/**
 * Recently viewed product
 * Includes viewing timestamp
 */
export interface RecentlyViewedProduct extends Product {
  viewed_at: string
}

/**
 * Product recommendation
 * Includes recommendation metadata
 */
export interface RecommendedProduct extends Product {
  recommendation_score?: number
  recommendation_reason?: string
}

/**
 * Helper function to ensure product object has slug
 * Use this when creating product objects from API responses
 */
export function ensureProductHasSlug<T extends { id: string; slug?: string }>(
  product: T
): asserts product is T & { slug: string } {
  if (!product.slug) {
    throw new Error(`Product ${product.id} is missing required slug field`)
  }
}

/**
 * Helper function to transform product for comparison
 * Ensures all required fields are present
 */
export function toComparisonProduct(product: Product): ComparisonProduct {
  ensureProductHasSlug(product)

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price || 0,
    images: product.featured_image_url ? [product.featured_image_url] : [],
    average_score: product.bifl_total_score || undefined,
    affiliate_link: product.affiliate_link || null,
    durability_score: product.durability_score || undefined,
    repairability_score: product.repairability_score || undefined,
    warranty_score: product.warranty_score || undefined,
    sustainability_score: product.sustainability_score || undefined,
    social_score: product.social_score || undefined,
  }
}
