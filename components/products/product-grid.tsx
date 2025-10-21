'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { ProductFilters } from './product-filters'
import BadgeDisplay from '@/components/BadgeDisplay'
import { AddToCompareButton } from '@/components/compare/add-to-compare-button'
import { FavoriteButton } from '@/components/favorites/favorite-button'
import { SlidersHorizontal, X } from 'lucide-react'

interface Product {
  id: string
  name: string
  brand_name?: string
  featured_image_url?: string | null
  price?: number | string | null
  bifl_total_score?: number | null
  warranty_score?: number | null
  social_score?: number | null
  repairability_score?: number | null
  sustainability_score?: number | null
  durability_score?: number | null
  affiliate_link?: string | null
  bifl_certification?: string[] | null
}

interface Category {
  id: string
  name: string
  slug: string
}

// Badge calculation function (matching BadgeDisplay logic)
function calculateBadges(product: Product): string[] {
  if (!product) return []

  const badges: string[] = []
  const totalScore = product.bifl_total_score || 0
  const warrantyScore = product.warranty_score || 0
  const socialScore = product.social_score || 0
  const repairabilityScore = product.repairability_score || 0
  const sustainabilityScore = product.sustainability_score || 0
  const buildQualityScore = product.durability_score || 0
  const durabilityScore = product.durability_score || 0

  // Gold Standard: 9.0+ average across all scores with high individual scores
  if (totalScore >= 9.0 &&
      buildQualityScore >= 8.5 &&
      durabilityScore >= 8.5 &&
      warrantyScore >= 8.0) {
    badges.push('Gold Standard')
  }

  // Lifetime Warranty: Warranty score = 10
  if (warrantyScore >= 10.0) {
    badges.push('Lifetime Warranty')
  }

  // Crowd Favorite: Social score ≥ 8.5
  if (socialScore >= 8.5) {
    badges.push('Crowd Favorite')
  }

  // Repair Friendly: Repairability score ≥ 8.5
  if (repairabilityScore >= 8.5) {
    badges.push('Repair Friendly')
  }

  // Eco Hero: Sustainability score ≥ 8.0
  if (sustainabilityScore >= 8.0) {
    badges.push('Eco Hero')
  }

  // BIFL Approved: 7.5+ across all categories (only if no other badges)
  if (badges.length === 0 &&
      totalScore >= 7.5 &&
      buildQualityScore >= 7.0 &&
      durabilityScore >= 7.0 &&
      warrantyScore >= 6.0) {
    badges.push('BIFL Approved')
  }

  return badges
}

function getScoreBadgeStyle(score: number) {
  const scoreString = score.toString()
  return {
    className: "score-field px-3 py-1 rounded-full transform transition-all duration-300",
    dataScore: scoreString
  }
}

// Get score label for accessibility
function getScoreLabel(score: number) {
  if (score >= 9.0) return "Legend"
  if (score >= 8.0) return "Excellent"
  if (score >= 7.0) return "Good"
  if (score >= 6.0) return "Fair"
  return "Poor"
}

// Product card component
function SimpleProductCard({ product }: { product: Product }) {
  const totalScore = product.bifl_total_score || 0

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 text-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
      <div className="relative mb-4">
        <Image
          className="w-full h-56 object-contain"
          src={product.featured_image_url || '/placeholder-product.png'}
          alt={product.name || 'Product'}
          width={400}
          height={224}
        />
        <BadgeDisplay
          product={product}
          size="xs"
          overlay={true}
        />
      </div>
      <h3 className="text-xl font-semibold">{product.name}</h3>
      <p className="text-brand-gray mb-4">{product.brand_name}</p>
      <div className="flex justify-center items-center gap-3 mb-6">
        <span className="text-sm font-medium text-brand-gray">BIFL Score:</span>
        <div
          className={`${getScoreBadgeStyle(totalScore).className} hover:scale-105`}
          data-score={getScoreBadgeStyle(totalScore).dataScore}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold tracking-wide">
              {totalScore.toFixed(1)}
            </span>
            <span className="text-xs font-medium opacity-90">
              {getScoreLabel(totalScore)}
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Link
          href={`/products/${product.id}`}
          className="w-full text-white font-semibold py-2 px-6 rounded-lg hover:bg-opacity-90 transition-colors cursor-pointer text-center"
          style={{ backgroundColor: '#4A9D93' }}
        >
          View Product
        </Link>
        <div className="flex justify-center items-center gap-2">
          <FavoriteButton
            productId={product.id}
            variant="small"
            className="border border-gray-300 bg-white hover:bg-gray-50"
          />
          <AddToCompareButton
            product={{
              id: product.id,
              name: product.name,
              price: parseFloat(product.price?.toString() || '0') || 0,
              images: product.featured_image_url ? [product.featured_image_url] : [],
              average_score: product.bifl_total_score ?? undefined,
              affiliate_link: product.affiliate_link ?? undefined
            }}
            size="sm"
            variant="secondary"
          />
        </div>
      </div>
    </div>
  )
}

interface ProductGridProps {
  initialProducts: Product[]
  categories: Category[]
  allCategories?: Category[]
  initialSearch?: string
}

export function ProductGrid({ initialProducts, categories, allCategories, initialSearch = '' }: ProductGridProps) {
  // Mobile filter drawer state
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  // Calculate the actual min and max price from all products
  const priceRange = useMemo(() => {
    const prices = initialProducts
      .map(p => parseFloat(p.price?.toString() || '0'))
      .filter(p => !isNaN(p) && p > 0)
    if (prices.length === 0) return [0, 10000]
    return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))]
  }, [initialProducts])

  const [filters, setFilters] = useState({
    search: initialSearch,
    categories: [] as string[],
    brands: [] as string[],
    badges: [] as string[],
    scoreRanges: [] as string[],
    countries: [] as string[],
    priceRange: priceRange as [number, number],
    sortBy: 'score-desc'
  })

  const [displayCount, setDisplayCount] = useState(48)
  const [pageSize, setPageSize] = useState(48)

  // Stable callback for filter changes
  const handleFiltersChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters)
  }, [])

  // Callback for mobile drawer that also closes the drawer
  const handleMobileFiltersChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters)
    setIsMobileFilterOpen(false)
  }, [])

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(pageSize)
  }, [filters, pageSize])

  // Filter and sort products based on current filters
  const filteredProducts = useMemo(() => {
    let filtered = [...initialProducts]

    // Search filter - improved to handle multi-word searches
    if (filters.search) {
      const searchTerm = filters.search.trim()
      const words = searchTerm.toLowerCase().split(/\s+/)

      if (words.length === 1) {
        // Single word search
        const searchLower = words[0]
        filtered = filtered.filter(product =>
          product.name?.toLowerCase().includes(searchLower) ||
          product.brand_name?.toLowerCase().includes(searchLower) ||
          (product as any).description?.toLowerCase().includes(searchLower) ||
          (product as any).use_case?.toLowerCase().includes(searchLower)
        )
      } else {
        // Multi-word search - prioritize products containing ALL words, then ANY words
        filtered = filtered.filter(product => {
          const name = product.name?.toLowerCase() || ''
          const brand = product.brand_name?.toLowerCase() || ''
          const description = (product as any).description?.toLowerCase() || ''
          const useCase = (product as any).use_case?.toLowerCase() || ''

          // Calculate relevance score
          let score = 0
          let matchCount = 0

          words.forEach(word => {
            if (name.includes(word)) {
              score += 3 // Name match is most important
              matchCount++
            } else if (brand.includes(word)) {
              score += 2 // Brand match is second most important
              matchCount++
            } else if (useCase.includes(word)) {
              score += 2.5 // Use case match is high priority
              matchCount++
            } else if (description.includes(word)) {
              score += 1 // Description match is least important
              matchCount++
            }
          })

          // Bonus for products containing ALL words
          if (matchCount === words.length) {
            score += 10 // Much larger bonus for ALL words
          }

          // For multi-word searches, require minimum relevance threshold
          let minScoreRequired = 1
          if (words.length >= 2) {
            minScoreRequired = 2
          }

          // Store score for sorting later
          (product as any)._searchScore = score

          // Return products with sufficient relevance score
          return score >= minScoreRequired
        })

        // Sort by relevance score (higher is better)
        filtered.sort((a, b) => ((b as any)._searchScore || 0) - ((a as any)._searchScore || 0))
      }
    }

    // Category filter (include subcategories)
    if (filters.categories.length > 0) {
      // Build a list of all category IDs including subcategories
      const categoryIdsToMatch: string[] = []
      filters.categories.forEach(categoryId => {
        categoryIdsToMatch.push(categoryId)
        // Add all subcategories of this category
        if (allCategories) {
          const subcats = allCategories.filter((cat: any) => cat.parent_id === categoryId)
          subcats.forEach((subcat: any) => categoryIdsToMatch.push(subcat.id))
        }
      })

      filtered = filtered.filter(product => {
        return categoryIdsToMatch.includes((product as any).category_id)
      })
    }

    // Brand filter
    if (filters.brands.length > 0) {
      filtered = filtered.filter(product =>
        filters.brands.includes(product.brand_name || '')
      )
    }

    // Badge filter
    if (filters.badges.length > 0) {
      filtered = filtered.filter(product => {
        const productBadges = product.bifl_certification || calculateBadges(product)
        return filters.badges.some(badge => productBadges.includes(badge))
      })
    }

    // Score range filter
    if (filters.scoreRanges.length > 0) {
      filtered = filtered.filter(product => {
        const score = product.bifl_total_score || 0
        return filters.scoreRanges.some(range => {
          switch (range) {
            case '9.0-10': return score >= 9.0 && score <= 10
            case '8.0-8.9': return score >= 8.0 && score < 9.0
            case '7.0-7.9': return score >= 7.0 && score < 8.0
            case '6.0-6.9': return score >= 6.0 && score < 7.0
            case '0.0-5.9': return score >= 0.0 && score < 6.0
            default: return false
          }
        })
      })
    }

    // Country filter
    if (filters.countries.length > 0) {
      filtered = filtered.filter(product =>
        filters.countries.includes((product as any).country_of_origin)
      )
    }

    // Price range filter
    // IMPORTANT: Always include products with null/0 prices to avoid hiding products with missing data
    // Bug fix: Previously filtered out 6 products with null prices
    filtered = filtered.filter(product => {
      if (!product.price) return true // Include products without prices
      const price = parseFloat(product.price.toString())
      if (isNaN(price) || price === 0) return true // Include products with invalid or zero prices
      return price >= filters.priceRange[0] && price <= filters.priceRange[1]
    })

    // Sort products
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'score-desc':
          return (b.bifl_total_score || 0) - (a.bifl_total_score || 0)
        case 'score-asc':
          return (a.bifl_total_score || 0) - (b.bifl_total_score || 0)
        case 'name-asc':
          return (a.name || '').localeCompare(b.name || '')
        case 'name-desc':
          return (b.name || '').localeCompare(a.name || '')
        case 'newest':
          return new Date((b as any).created_at || 0).getTime() - new Date((a as any).created_at || 0).getTime()
        default:
          return 0
      }
    })

    return filtered
  }, [initialProducts, filters])

  // Get products to display based on current display count
  const displayedProducts = filteredProducts.slice(0, displayCount)
  const hasMore = displayCount < filteredProducts.length

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + pageSize)
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    if (newSize === filteredProducts.length) {
      setDisplayCount(filteredProducts.length)
    } else {
      setDisplayCount(newSize)
    }
  }

  return (
    <>
      {/* Mobile Filter Button (FAB) - Only visible on mobile */}
      <button
        onClick={() => setIsMobileFilterOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 bg-brand-teal text-white rounded-full shadow-lg hover:bg-brand-teal/90 transition-all duration-300 hover:scale-110 min-w-[56px] min-h-[56px] flex items-center justify-center gap-2 px-4"
        aria-label="Open filters"
      >
        <SlidersHorizontal className="w-6 h-6" />
        <span className="font-semibold">Filters</span>
      </button>

      {/* Mobile Filter Drawer Overlay */}
      {isMobileFilterOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-50 transition-opacity"
          onClick={() => setIsMobileFilterOpen(false)}
        />
      )}

      {/* Mobile Filter Drawer */}
      <div
        className={`lg:hidden fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isMobileFilterOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-brand-dark">Filters</h2>
          <button
            onClick={() => setIsMobileFilterOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close filters"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-4">
          <ProductFilters
            onFiltersChange={handleMobileFiltersChange}
            categories={categories}
            allCategories={allCategories || categories}
            products={initialProducts}
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Filters Sidebar - Hidden on mobile, visible on desktop */}
        <div className="hidden lg:block lg:col-span-3">
          <ProductFilters
            onFiltersChange={handleFiltersChange}
            categories={categories}
            allCategories={allCategories || categories}
            products={initialProducts}
          />
        </div>

        {/* Product Grid Container - Full width on mobile, 9 cols on desktop */}
        <div className="col-span-12 lg:col-span-9">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <p className="text-brand-gray text-sm sm:text-base">
              Showing <span className="font-bold text-brand-dark">1-{Math.min(displayCount, filteredProducts.length)}</span> of <span className="font-bold text-brand-dark">{filteredProducts.length}</span> products
            </p>
            <div className="flex items-center gap-2">
              <label className="text-sm text-brand-gray">Show:</label>
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-brand-teal focus:border-brand-teal min-h-[44px]"
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              >
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
                <option value={72}>72</option>
                <option value={filteredProducts.length}>All ({filteredProducts.length})</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-sm text-brand-gray whitespace-nowrap">Sort by:</label>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-brand-teal focus:border-brand-teal min-h-[44px] flex-1 sm:flex-none"
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
            >
              <option value="score-desc">Score: High to Low</option>
              <option value="score-asc">Score: Low to High</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedProducts.map((product) => (
            <SimpleProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="flex justify-center mt-8 mb-20 lg:mb-8">
            <button
              onClick={handleLoadMore}
              className="px-6 py-3 text-white font-medium text-sm rounded-lg transition-colors bg-gray-500 hover:bg-gray-600 min-h-[44px]"
            >
              Load More ({filteredProducts.length - displayCount} remaining)
            </button>
          </div>
        )}

        {/* No results message */}
        {filteredProducts.length === 0 && (
          <Card className="p-12 text-center bg-white border border-brand-teal/20 rounded-2xl shadow-lg">
            <CardContent>
              <div className="w-20 h-20 mx-auto mb-6 bg-brand-teal/10 rounded-full flex items-center justify-center">
                <div className="w-10 h-10 bg-brand-teal/20 rounded-full"></div>
              </div>
              <h3 className="text-2xl font-bold text-brand-dark mb-3">No products found</h3>
              <p className="text-brand-gray max-w-md mx-auto">
                Try adjusting your filters or search terms to find more products.
              </p>
            </CardContent>
          </Card>
        )}
        </div>
      </div>
    </>
  )
}