import { Metadata } from 'next'
import {
  getProductsFilteredCached,
  getProductFacetsCached,
  getCategoriesCached,
  getAllCategoriesCached,
  type ProductFilterParams,
} from '@/lib/supabase/queries'
import { Card, CardContent } from '@/components/ui/card'
import { ProductGrid } from '@/components/products/product-grid'
import type { FilterState } from '@/components/products/product-filters'

// Enable Next.js caching and revalidation
export const revalidate = 1800 // Revalidate every 30 minutes

interface ProductsSearchParams {
  search?: string
  categories?: string
  badge?: string
  brands?: string
  countries?: string
  score?: string
  price_min?: string
  price_max?: string
  sort?: string
  page?: string
}

interface ProductsPageProps {
  searchParams: Promise<ProductsSearchParams>
}

const SORTS = ['score-desc', 'score-asc', 'name-asc', 'name-desc', 'newest'] as const

function parseParams(sp: ProductsSearchParams) {
  const split = (v: string | undefined, sep: string) =>
    v ? v.split(sep).map((x) => x.trim()).filter(Boolean) : []
  const page = Math.max(1, parseInt(sp.page || '1', 10) || 1)
  const sort = (SORTS as readonly string[]).includes(sp.sort || '') ? sp.sort! : 'score-desc'
  return {
    search: sp.search?.trim() || '',
    categoryIds: split(sp.categories, ','),
    badges: split(sp.badge, ','),
    brands: split(sp.brands, '|'),
    countries: split(sp.countries, '|'),
    scoreRanges: split(sp.score, ','),
    priceMin: sp.price_min ? Number(sp.price_min) : undefined,
    priceMax: sp.price_max ? Number(sp.price_max) : undefined,
    sort: sort as ProductFilterParams['sort'],
    page,
  }
}

// Generate metadata dynamically to handle search queries and pagination
export async function generateMetadata({ searchParams }: ProductsPageProps): Promise<Metadata> {
  const sp = await searchParams
  const p = parseParams(sp)

  // Anything except pure pagination is a filtered view -> noindex
  const isFiltered =
    !!p.search ||
    p.categoryIds.length > 0 ||
    p.badges.length > 0 ||
    p.brands.length > 0 ||
    p.countries.length > 0 ||
    p.scoreRanges.length > 0 ||
    p.priceMin != null ||
    p.priceMax != null

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.buyitforlifeproducts.com'
  const titleBase = 'All Products - Buy It For Life'
  const title = p.page > 1 ? `${titleBase} (Page ${p.page})` : titleBase
  // Unfiltered paginated pages carry self-referencing canonicals so every
  // product stays reachable through crawlable pagination.
  const canonical =
    !isFiltered && p.page > 1 ? `${baseUrl}/products?page=${p.page}` : `${baseUrl}/products`

  return {
    title,
    description:
      'Browse the full catalog of community-verified BIFL products. Filter by category, durability score, and price. Find quality items built to last a lifetime.',
    keywords: ['BIFL products', 'durable products', 'buy it for life catalog', 'quality products', 'long-lasting items'],

    openGraph: {
      title,
      description: 'Browse community-verified BIFL products. Filter by category, durability score, and price.',
      url: canonical,
      siteName: 'Buy It For Life',
      type: 'website',
    },

    twitter: {
      card: 'summary',
      title,
      description: 'Browse community-verified BIFL products. Filter by category, durability score, and price.',
    },

    alternates: { canonical },

    robots: {
      index: !isFiltered,
      follow: true,
    },
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const sp = await searchParams
  const p = parseParams(sp)

  try {
    const [mainCategories, allCategories, facets] = await Promise.all([
      getCategoriesCached(),
      getAllCategoriesCached(),
      getProductFacetsCached(),
    ])

    // Selected categories include their subcategories (matches the old
    // client-side behavior for the homepage category links)
    const categoryIdsWithSubs = p.categoryIds.flatMap((id) => [
      id,
      ...allCategories.filter((c) => c.parent_id === id).map((c) => c.id),
    ])

    const { products, total, page, totalPages, pageSize } = await getProductsFilteredCached({
      search: p.search || undefined,
      categoryIds: categoryIdsWithSubs.length ? categoryIdsWithSubs : undefined,
      badges: p.badges.length ? p.badges : undefined,
      brands: p.brands.length ? p.brands : undefined,
      countries: p.countries.length ? p.countries : undefined,
      scoreRanges: p.scoreRanges.length ? p.scoreRanges : undefined,
      priceMin: p.priceMin,
      priceMax: p.priceMax,
      sort: p.sort,
      page: p.page,
    })

    const filterState: FilterState = {
      search: p.search,
      categories: p.categoryIds,
      brands: p.brands,
      badges: p.badges,
      scoreRanges: p.scoreRanges,
      countries: p.countries,
      priceRange: [p.priceMin ?? facets.priceRange[0], p.priceMax ?? facets.priceRange[1]],
    }

    return (
      <div className="bg-brand-cream text-brand-dark">
        {/* Hero Section */}
        <section className="bg-white text-center py-8 border-b border-gray-200">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold tracking-tight mb-2">All BIFL Products</h1>
            <p className="text-base text-brand-gray max-w-2xl mx-auto">
              Explore our full database of durable, high-quality products. Filter by category or BIFL score to find exactly what you need.
            </p>
          </div>
        </section>

        {/* Product Grid Section */}
        <section className="py-8">
          <div className="container mx-auto px-12">
            <ProductGrid
              products={products}
              total={total}
              page={page}
              totalPages={totalPages}
              pageSize={pageSize}
              categories={mainCategories || []}
              allCategories={allCategories || []}
              facets={facets}
              filters={filterState}
              sort={p.sort || 'score-desc'}
            />
          </div>
        </section>
      </div>
    )
  } catch (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-cream to-white">
        <div className="container mx-auto py-12">
          <Card className="border-score-red bg-white shadow-lg rounded-2xl max-w-2xl mx-auto">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-score-red/10 rounded-full flex items-center justify-center">
                <div className="w-10 h-10 bg-score-red/20 rounded-full"></div>
              </div>
              <h3 className="text-2xl font-bold text-score-red mb-3">
                Failed to load products
              </h3>
              <p className="text-brand-gray">
                {error instanceof Error ? error.message : 'Unknown error occurred'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
}
