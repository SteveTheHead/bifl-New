'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ProductCard } from '@/components/products/product-card'
import { BuyingGuideSection } from '@/components/categories/buying-guide-section'
import { CategoryFilters } from '@/components/categories/category-filters'
import { Filter, Grid, List, ChevronDown, ChevronUp } from 'lucide-react'
import { BuyingGuide } from '@/lib/ai/buying-guide'

interface Product {
  id: string
  name: string
  slug: string
  featured_image_url: string | null
  price: number | null
  bifl_total_score: number | null
  brand_name: string
  brand_slug: string
  excerpt: string | null
  durability_score: number | null
  repairability_score: number | null
  warranty_years: number | null
}

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
}

interface Subcategory {
  id: string
  name: string
  slug: string
  description: string | null
}

interface Brand {
  name: string
  slug: string
}

interface CategoryPageClientProps {
  category: Category
  products: Product[]
  availableBrands: Brand[]
  subcategories?: Subcategory[]
  initialFilters: {
    sort?: string
    price_min?: string
    price_max?: string
    brand?: string
  }
}

export function CategoryPageClient({
  category,
  products,
  availableBrands,
  subcategories = [],
  initialFilters
}: CategoryPageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [buyingGuide, setBuyingGuide] = useState<BuyingGuide | null>(null)
  const [loadingGuide, setLoadingGuide] = useState(true)
  const [showBuyingGuide, setShowBuyingGuide] = useState(true)

  // Fetch buying guide
  useEffect(() => {
    const fetchBuyingGuide = async () => {
      try {
        setLoadingGuide(true)
        const response = await fetch(`/api/categories/${category.slug}/buying-guide`)
        if (response.ok) {
          const text = await response.text()
          try {
            const data = JSON.parse(text)
            setBuyingGuide(data.buyingGuide)
          } catch (parseError) {
            console.error('Error parsing buying guide JSON:', parseError)
            setBuyingGuide(null)
          }
        } else {
          setBuyingGuide(null)
        }
      } catch (error) {
        console.error('Error fetching buying guide:', error)
        setBuyingGuide(null)
      } finally {
        setLoadingGuide(false)
      }
    }

    fetchBuyingGuide()
  }, [category.slug])

  const updateFilters = (newFilters: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== '') {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })

    router.push(`/categories/${category.slug}?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push(`/categories/${category.slug}`)
  }

  // Generate structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${category.name} - Buy It For Life Products`,
    "description": category.description || `Best ${category.name} products built to last`,
    "url": `https://bifl.com/categories/${category.slug}`,
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://bifl.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Categories",
          "item": "https://bifl.com/categories"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": category.name,
          "item": `https://bifl.com/categories/${category.slug}`
        }
      ]
    },
    "hasPart": products.slice(0, 10).map((product, _index) => ({
      "@type": "Product",
      "name": product.name,
      "brand": {
        "@type": "Brand",
        "name": product.brand_name
      },
      "description": product.excerpt || `High-quality ${category.name} product`,
      "url": `https://bifl.com/products/${product.slug || product.id}`,
      "image": product.featured_image_url,
      "offers": product.price ? {
        "@type": "Offer",
        "price": product.price,
        "priceCurrency": "USD"
      } : undefined,
      "aggregateRating": product.bifl_total_score ? {
        "@type": "AggregateRating",
        "ratingValue": product.bifl_total_score,
        "bestRating": 10,
        "worstRating": 0
      } : undefined
    }))
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-brand-dark mb-4">{category.name}</h1>
        {category.description && (
          <p className="text-lg text-brand-gray leading-relaxed mb-6">
            {category.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex flex-wrap gap-6 text-sm text-brand-gray">
          <span>{products.length} Products</span>
          <span>Expert Reviews</span>
          <span>AI-Generated Buying Guide</span>
        </div>
      </div>

      {/* Subcategories */}
      {subcategories && subcategories.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-brand-dark mb-4">Browse by Subcategory</h2>
          <div className="flex flex-wrap gap-3">
            {subcategories.map((subcategory) => (
              <a
                key={subcategory.id}
                href={`/categories/${subcategory.slug}`}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-brand-teal hover:bg-brand-teal/5 transition-all text-sm font-medium text-brand-dark hover:text-brand-teal"
              >
                {subcategory.name}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Buying Guide Section */}
      {showBuyingGuide && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-brand-dark">
              {category.name} Buying Guide
            </h2>
            <button
              onClick={() => setShowBuyingGuide(!showBuyingGuide)}
              className="flex items-center text-brand-teal hover:text-brand-teal/80 transition-colors"
            >
              {showBuyingGuide ? (
                <>
                  Hide Guide <ChevronUp className="w-4 h-4 ml-1" />
                </>
              ) : (
                <>
                  Show Guide <ChevronDown className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </div>

          <BuyingGuideSection
            buyingGuide={buyingGuide}
            loading={loadingGuide}
            categoryName={category.name}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </button>

              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-brand-teal text-white'
                      : 'text-brand-gray hover:bg-gray-50'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-colors ${
                    viewMode === 'list'
                      ? 'bg-brand-teal text-white'
                      : 'text-brand-gray hover:bg-gray-50'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="text-sm text-brand-gray">
              Showing {products.length} results
            </div>
          </div>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="lg:hidden mb-6 p-4 bg-white rounded-lg border border-gray-200">
              <CategoryFilters
                availableBrands={availableBrands}
                initialFilters={initialFilters}
                onFilterChange={updateFilters}
                onClearFilters={clearFilters}
              />
            </div>
          )}

          {/* Products Grid */}
          {products.length > 0 ? (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                  : 'space-y-4'
              }
            >
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  variant={viewMode === 'list' ? 'horizontal' : 'vertical'}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-brand-gray text-lg mb-4">
                No products found matching your criteria.
              </p>
              <button
                onClick={clearFilters}
                className="text-brand-teal hover:text-brand-teal/80 font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-brand-dark mb-4">Filter Products</h3>
            <CategoryFilters
              availableBrands={availableBrands}
              initialFilters={initialFilters}
              onFilterChange={updateFilters}
              onClearFilters={clearFilters}
            />
          </div>

          {/* Quick Stats */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-brand-dark mb-4">Category Stats</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-brand-gray">Total Products:</span>
                <span className="font-medium">{products.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-gray">Price Range:</span>
                <span className="font-medium">
                  {products.length > 0 ? (
                    `$${Math.min(...products.filter(p => p.price).map(p => p.price!))} - $${Math.max(...products.filter(p => p.price).map(p => p.price!))}`
                  ) : (
                    'N/A'
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-gray">Avg. BIFL Score:</span>
                <span className="font-medium">
                  {products.length > 0 ? (
                    (products.filter(p => p.bifl_total_score).reduce((sum, p) => sum + p.bifl_total_score!, 0) /
                     products.filter(p => p.bifl_total_score).length).toFixed(1)
                  ) : (
                    'N/A'
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  )
}