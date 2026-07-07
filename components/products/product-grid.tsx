'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { ProductFilters, type FilterState } from './product-filters'
import BadgeDisplay from '@/components/BadgeDisplay'
import { AddToCompareButton } from '@/components/compare/add-to-compare-button'
import { FavoriteButton } from '@/components/favorites/favorite-button'
import { SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { getScoreLabel } from '@/lib/scoring'
import { trackProductSearch } from '@/lib/analytics'
import type { ProductGridRow, ProductFacets } from '@/lib/supabase/queries'

interface Category {
  id: string
  name: string
  slug: string
}

// Product card component
function ProductCard({ product }: { product: ProductGridRow }) {
  const totalScore = product.bifl_total_score || 0

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 text-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
      <Link href={`/products/${product.slug}`} className="relative mb-4 block group/image">
        <Image
          className="w-full h-56 object-contain group-hover/image:scale-105 transition-transform duration-300"
          src={product.featured_image_url || '/placeholder-product.png'}
          alt={product.name || 'Product'}
          width={400}
          height={224}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <BadgeDisplay product={product} size="xs" overlay={true} />
      </Link>
      <h3 className="text-xl font-semibold">{product.name}</h3>
      <p className="text-brand-gray mb-4">{product.brand_name}</p>
      <div className="flex justify-center items-center gap-3 mb-6">
        <span className="text-sm font-medium text-brand-gray">BIFL Score:</span>
        <div
          className="score-field px-3 py-1 rounded-full transform transition-all duration-300 hover:scale-105"
          data-score={totalScore.toString()}
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
          href={`/products/${product.slug}`}
          className="w-full text-white font-semibold py-2 px-6 rounded-lg hover:bg-opacity-90 transition-colors cursor-pointer text-center"
          style={{ backgroundColor: '#4A9D93' }}
        >
          View Product
        </Link>
        <div className="flex justify-center items-center gap-2">
          <FavoriteButton
            productId={product.id}
            productName={product.name}
            variant="small"
            className="border border-gray-300 bg-white hover:bg-gray-50"
          />
          <AddToCompareButton
            product={{
              id: product.id,
              name: product.name,
              slug: product.slug,
              price: parseFloat(product.price?.toString() || '0') || 0,
              images: product.featured_image_url ? [product.featured_image_url] : [],
              average_score: product.bifl_total_score ?? undefined,
            }}
            size="sm"
            variant="secondary"
          />
        </div>
      </div>
    </div>
  )
}

export interface ProductGridProps {
  products: ProductGridRow[]
  total: number
  page: number
  totalPages: number
  pageSize: number
  categories: Category[]
  allCategories?: Category[]
  facets: ProductFacets
  filters: FilterState
  sort: string
}

/**
 * URL-driven product browser (audit M6). The server fetches one page of
 * filtered rows; this shell renders them and turns every filter/sort/page
 * interaction into a URL update, which re-renders the server component.
 * Nothing is filtered client-side anymore.
 */
export function ProductGrid({
  products,
  total,
  page,
  totalPages,
  pageSize,
  categories,
  allCategories,
  facets,
  filters,
  sort,
}: ProductGridProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Analytics: log each distinct search term once it lands in the URL
  useEffect(() => {
    if (filters.search.trim()) trackProductSearch(filters.search.trim())
  }, [filters.search])

  const buildQuery = (f: FilterState, sortBy: string, pageNum: number): string => {
    const params = new URLSearchParams()
    if (f.search.trim()) params.set('search', f.search.trim())
    if (f.categories.length) params.set('categories', f.categories.join(','))
    if (f.badges.length) params.set('badge', f.badges.join(','))
    if (f.brands.length) params.set('brands', f.brands.join('|'))
    if (f.countries.length) params.set('countries', f.countries.join('|'))
    if (f.scoreRanges.length) params.set('score', f.scoreRanges.join(','))
    if (f.priceRange[0] > facets.priceRange[0]) params.set('price_min', String(f.priceRange[0]))
    if (f.priceRange[1] < facets.priceRange[1]) params.set('price_max', String(f.priceRange[1]))
    if (sortBy && sortBy !== 'score-desc') params.set('sort', sortBy)
    if (pageNum > 1) params.set('page', String(pageNum))
    const qs = params.toString()
    return qs ? `/products?${qs}` : '/products'
  }

  const navigate = (url: string) => {
    startTransition(() => {
      router.replace(url, { scroll: false })
    })
  }

  // Filter changes reset to page 1; text/slider input is debounced so the
  // server isn't hit per keystroke.
  const handleFiltersChange = (f: FilterState) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => navigate(buildQuery(f, sort, 1)), 350)
  }

  const handleMobileFiltersChange = (f: FilterState) => {
    handleFiltersChange(f)
    setIsMobileFilterOpen(false)
  }

  const handleSortChange = (sortBy: string) => navigate(buildQuery(filters, sortBy, 1))

  const pageHref = (pageNum: number) => buildQuery(filters, sort, pageNum)

  const hasActiveFilters =
    filters.search !== '' ||
    filters.categories.length > 0 ||
    filters.brands.length > 0 ||
    filters.badges.length > 0 ||
    filters.scoreRanges.length > 0 ||
    filters.countries.length > 0 ||
    filters.priceRange[0] > facets.priceRange[0] ||
    filters.priceRange[1] < facets.priceRange[1]

  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, total)

  // Windowed page list: 1 … (page-1, page, page+1) … last
  const pageNumbers: (number | '…')[] = []
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) {
      pageNumbers.push(p)
    } else if (pageNumbers[pageNumbers.length - 1] !== '…') {
      pageNumbers.push('…')
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
            facets={facets}
            value={filters}
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
            facets={facets}
            value={filters}
          />
        </div>

        {/* Product Grid Container - Full width on mobile, 9 cols on desktop */}
        <div className="col-span-12 lg:col-span-9">
          {/* Active Filters Indicator */}
          {hasActiveFilters && (
            <div className="mb-4 p-4 bg-teal-50 border-2 border-teal-400 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <p className="text-sm text-gray-900 flex-1">
                <span className="font-semibold">Filters active:</span>
                {filters.search && <span className="ml-2">Search: &quot;{filters.search}&quot;</span>}
                {filters.categories.length > 0 && <span className="ml-2">• {filters.categories.length} {filters.categories.length === 1 ? 'category' : 'categories'}</span>}
                {filters.brands.length > 0 && <span className="ml-2">• {filters.brands.length} {filters.brands.length === 1 ? 'brand' : 'brands'}</span>}
                {filters.badges.length > 0 && <span className="ml-2">• {filters.badges.length} {filters.badges.length === 1 ? 'badge' : 'badges'}</span>}
                {filters.scoreRanges.length > 0 && <span className="ml-2">• Score filter</span>}
                {filters.countries.length > 0 && <span className="ml-2">• {filters.countries.length} {filters.countries.length === 1 ? 'country' : 'countries'}</span>}
                {(filters.priceRange[0] > facets.priceRange[0] || filters.priceRange[1] < facets.priceRange[1]) && <span className="ml-2">• Price range</span>}
              </p>
              <button
                onClick={() => navigate('/products')}
                className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors text-sm font-medium"
              >
                <X className="w-4 h-4 mr-1" />
                Clear All
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <p className="text-brand-gray text-sm sm:text-base">
              Showing <span className="font-bold text-brand-dark">{rangeStart}-{rangeEnd}</span> of <span className="font-bold text-brand-dark">{total}</span> products
            </p>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label htmlFor="products-sort" className="text-sm text-brand-gray whitespace-nowrap">Sort by:</label>
              <select
                id="products-sort"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-brand-teal focus:border-brand-teal min-h-[44px] flex-1 sm:flex-none"
                value={sort}
                onChange={(e) => handleSortChange(e.target.value)}
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
          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-opacity ${isPending ? 'opacity-60' : ''}`}
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav aria-label="Product pages" className="flex justify-center items-center gap-1 mt-8 mb-20 lg:mb-8">
              {page > 1 && (
                <Link
                  href={pageHref(page - 1)}
                  scroll={true}
                  className="px-3 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 flex items-center gap-1"
                  rel="prev"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </Link>
              )}
              {pageNumbers.map((p, i) =>
                p === '…' ? (
                  <span key={`gap-${i}`} className="px-2 text-gray-400">…</span>
                ) : (
                  <Link
                    key={p}
                    href={pageHref(p)}
                    scroll={true}
                    aria-current={p === page ? 'page' : undefined}
                    className={`px-4 py-2 rounded-lg text-sm border ${
                      p === page
                        ? 'bg-brand-teal text-white border-brand-teal font-semibold'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </Link>
                )
              )}
              {page < totalPages && (
                <Link
                  href={pageHref(page + 1)}
                  scroll={true}
                  className="px-3 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 flex items-center gap-1"
                  rel="next"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </nav>
          )}

          {/* No results message */}
          {products.length === 0 && (
            <Card className="p-12 text-center bg-white border border-brand-teal/20 rounded-2xl shadow-lg">
              <CardContent>
                <div className="w-20 h-20 mx-auto mb-6 bg-brand-teal/10 rounded-full flex items-center justify-center">
                  <div className="w-10 h-10 bg-brand-teal/20 rounded-full"></div>
                </div>
                <h3 className="text-2xl font-bold text-brand-dark mb-3">No products found</h3>
                <p className="text-brand-gray max-w-md mx-auto mb-6">
                  Try adjusting your filters or search terms to find more products.
                </p>
                <button
                  onClick={() => navigate('/products')}
                  className="inline-flex items-center px-6 py-3 bg-brand-teal text-white rounded-lg hover:bg-brand-teal/90 transition-colors font-medium"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear All Filters
                </button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}
