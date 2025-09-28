'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { ProductFilters } from './product-filters'
import BadgeDisplay from '@/components/BadgeDisplay'
import { AddToCompareButton } from '@/components/compare/add-to-compare-button'
import { FavoriteButton } from '@/components/favorites/favorite-button'

// Badge calculation function (matching BadgeDisplay logic)
function calculateBadges(product: any): string[] {
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
function SimpleProductCard({ product }: { product: any }) {
  const totalScore = product.bifl_total_score || 0

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 text-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
      <div className="relative mb-4">
        <img
          className="w-full h-56 object-contain"
          src={product.featured_image_url || '/placeholder-product.png'}
          alt={product.name || 'Product'}
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
              price: parseFloat(product.price) || 0,
              images: product.featured_image_url ? [product.featured_image_url] : [],
              average_score: product.bifl_total_score,
              affiliate_link: product.affiliate_link
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
  initialProducts: any[]
  categories: any[]
  initialSearch?: string
}

export function ProductGrid({ initialProducts, categories, initialSearch = '' }: ProductGridProps) {
  const [filters, setFilters] = useState({
    search: initialSearch,
    categories: [] as string[],
    brands: [] as string[],
    badges: [] as string[],
    scoreRanges: [] as string[],
    countries: [] as string[],
    priceRange: [0, 1000] as [number, number],
    sortBy: 'score-desc'
  })

  const [displayCount, setDisplayCount] = useState(48)
  const [pageSize, setPageSize] = useState(48)

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
          product.description?.toLowerCase().includes(searchLower) ||
          product.use_case?.toLowerCase().includes(searchLower)
        )
      } else {
        // Multi-word search - prioritize products containing ALL words, then ANY words
        filtered = filtered.filter(product => {
          const name = product.name?.toLowerCase() || ''
          const brand = product.brand_name?.toLowerCase() || ''
          const description = product.description?.toLowerCase() || ''
          const useCase = product.use_case?.toLowerCase() || ''

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
          const minScoreRequired = words.length >= 2 ? 2 : 1

          // Store score for sorting later
          product._searchScore = score

          // Return products with sufficient relevance score
          return score >= minScoreRequired
        })

        // Sort by relevance score (higher is better)
        filtered.sort((a, b) => (b._searchScore || 0) - (a._searchScore || 0))
      }
    }

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(product => {
        return filters.categories.includes(product.category_id)
      })
    }

    // Brand filter
    if (filters.brands.length > 0) {
      filtered = filtered.filter(product =>
        filters.brands.includes(product.wordpress_meta?.brand_name)
      )
    }

    // Badge filter
    if (filters.badges.length > 0) {
      filtered = filtered.filter(product => {
        const productBadges = calculateBadges(product)
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
        filters.countries.includes(product.country_of_origin)
      )
    }

    // Price range filter
    filtered = filtered.filter(product => {
      const price = parseFloat(product.price)
      if (isNaN(price)) return true // Include products without prices
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
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
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
    <div className="grid grid-cols-12 gap-8">
      {/* Filters Sidebar */}
      <ProductFilters
        onFiltersChange={setFilters}
        categories={categories}
        products={initialProducts}
      />

      {/* Product Grid Container */}
      <div className="col-span-9">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <p className="text-brand-gray">
              Showing <span className="font-bold text-brand-dark">1-{Math.min(displayCount, filteredProducts.length)}</span> of <span className="font-bold text-brand-dark">{filteredProducts.length}</span> products
            </p>
            <div className="flex items-center gap-2">
              <label className="text-sm text-brand-gray">Show:</label>
              <select
                className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-brand-teal focus:border-brand-teal"
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
          <div className="flex items-center gap-2">
            <label className="text-sm text-brand-gray">Sort by:</label>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-brand-teal focus:border-brand-teal"
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
          <div className="flex justify-center mt-8">
            <button
              onClick={handleLoadMore}
              className="px-6 py-2 text-white font-medium text-sm rounded-lg transition-colors bg-gray-500 hover:bg-gray-600"
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
  )
}