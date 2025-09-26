'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { ProductFilters } from './product-filters'

// Get gradient pill styling based on BIFL score
function getScoreBadgeStyle(score: number) {
  if (score >= 9.0) {
    return {
      className: "text-white shadow-score-pill border border-green-200",
      style: { background: "linear-gradient(135deg, #4CAF50 0%, #66BB6A 50%, #81C784 100%)" }
    }
  } else if (score >= 8.0) {
    return {
      className: "text-white shadow-score-pill border border-yellow-200",
      style: { background: "linear-gradient(135deg, #FFC107 0%, #FFD54F 50%, #FFE082 100%)" }
    }
  } else if (score >= 7.0) {
    return {
      className: "text-white shadow-score-pill border border-orange-200",
      style: { background: "linear-gradient(135deg, #FF9800 0%, #FFB74D 50%, #FFCC02 100%)" }
    }
  } else if (score >= 6.0) {
    return {
      className: "text-white shadow-score-pill border border-red-200",
      style: { background: "linear-gradient(135deg, #F44336 0%, #EF5350 50%, #E57373 100%)" }
    }
  } else {
    return {
      className: "text-gray-700 shadow-score-pill border border-gray-200",
      style: { background: "linear-gradient(135deg, #9E9E9E 0%, #BDBDBD 50%, #E0E0E0 100%)" }
    }
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
      <img
        className="w-full h-56 object-contain mb-4"
        src={product.featured_image_url || '/placeholder-product.png'}
        alt={product.name || 'Product'}
      />
      <h3 className="text-xl font-semibold">{product.name}</h3>
      <p className="text-brand-gray mb-4">{product.brand_name}</p>
      <div className="flex justify-center items-center gap-3 mb-6">
        <span className="text-sm font-medium text-brand-gray">BIFL Score:</span>
        <div
          className={`relative px-5 py-2 rounded-full transform transition-all duration-300 hover:scale-105 ${getScoreBadgeStyle(totalScore).className}`}
          style={getScoreBadgeStyle(totalScore).style}
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
      <Link
        href={`/products/${product.id}`}
        className="block text-white font-semibold py-2 px-6 rounded-lg hover:bg-opacity-90 transition-colors cursor-pointer"
        style={{ backgroundColor: '#4A9D93' }}
      >
        View Product
      </Link>
    </div>
  )
}

interface ProductGridProps {
  initialProducts: any[]
  categories: any[]
  brands: any[]
}

export function ProductGrid({ initialProducts, categories, brands }: ProductGridProps) {
  const [filters, setFilters] = useState({
    search: '',
    categories: [] as string[],
    brands: [] as string[],
    scoreRanges: [] as string[],
    sortBy: 'score-desc'
  })

  // Filter and sort products based on current filters
  const filteredProducts = useMemo(() => {
    let filtered = [...initialProducts]

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(searchLower) ||
        product.brand_name?.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower)
      )
    }

    // Category filter
    if (filters.categories.length > 0) {
      console.log('🔍 Category filtering:', filters.categories)
      console.log('🔍 Sample product category_id:', filtered[0]?.category_id)
      const beforeCount = filtered.length
      filtered = filtered.filter(product => {
        const matches = filters.categories.includes(product.category_id)
        if (matches) {
          console.log('✅ Product matches:', product.name, product.category_id)
        }
        return matches
      })
      console.log(`🔍 Filtered from ${beforeCount} to ${filtered.length} products`)
    }

    // Brand filter
    if (filters.brands.length > 0) {
      filtered = filtered.filter(product =>
        filters.brands.includes(product.brand_id)
      )
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
            default: return false
          }
        })
      })
    }

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

  return (
    <div className="grid grid-cols-12 gap-8">
      {/* Filters Sidebar */}
      <ProductFilters
        onFiltersChange={setFilters}
        categories={categories}
        brands={brands}
        products={initialProducts}
      />

      {/* Product Grid Container */}
      <div className="col-span-9">
        <div className="flex justify-between items-center mb-6">
          <p className="text-brand-gray">
            Showing <span className="font-bold text-brand-dark">1-{filteredProducts.length}</span> of <span className="font-bold text-brand-dark">{filteredProducts.length}</span> products
          </p>
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
          {filteredProducts.map((product) => (
            <SimpleProductCard key={product.id} product={product} />
          ))}
        </div>

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