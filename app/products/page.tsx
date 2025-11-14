import { Metadata } from 'next'
import { getProducts, getCategories, getAllCategories, getPriceRanges } from '@/lib/supabase/queries'
import { Card, CardContent } from '@/components/ui/card'
import { ProductGrid } from '@/components/products/product-grid'

// Enable Next.js caching and revalidation
export const revalidate = 1800 // Revalidate every 30 minutes

interface ProductsPageProps {
  searchParams: Promise<{ search?: string }>
}

// Generate metadata dynamically to handle search queries
export async function generateMetadata({ searchParams }: ProductsPageProps): Promise<Metadata> {
  const { search } = await searchParams
  const hasSearch = !!search

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.buyitforlifeproducts.com'

  return {
    title: 'All Products - Buy It For Life',
    description: 'Browse 327+ expertly reviewed BIFL products. Filter by category, durability score, and price. Find quality items built to last a lifetime with comprehensive ratings.',
    keywords: ['BIFL products', 'durable products', 'buy it for life catalog', 'quality products', 'long-lasting items'],

    openGraph: {
      title: 'All Products - Buy It For Life',
      description: 'Browse 327+ expertly reviewed BIFL products. Filter by category, durability score, and price.',
      url: `${baseUrl}/products`,
      siteName: 'Buy It For Life',
      type: 'website',
    },

    twitter: {
      card: 'summary',
      title: 'All Products - Buy It For Life',
      description: 'Browse 327+ expertly reviewed BIFL products. Filter by category, durability score, and price.',
    },

    alternates: {
      canonical: `${baseUrl}/products`, // Always canonical to base URL
    },

    robots: {
      index: !hasSearch, // Don't index search results
      follow: true,
    },
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { search } = await searchParams
  try {
    // Get products and taxonomy data
    // Note: In dev mode this may be slow, but production with caching will be fast
    const [products, mainCategories, allCategories, priceRanges] = await Promise.all([
      getProducts(0, 0), // Get all products (needed for client-side filtering)
      getCategories(), // Main categories for display
      getAllCategories(), // All categories including subcategories for counting
      getPriceRanges()
    ])

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
              initialProducts={products || []}
              categories={mainCategories || []}
              allCategories={allCategories || []}
              initialSearch={search || ''}
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