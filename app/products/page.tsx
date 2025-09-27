import { getProducts, getCategories, getPriceRanges } from '@/lib/supabase/queries'
import { Card, CardContent } from '@/components/ui/card'
import { ProductGrid } from '@/components/products/product-grid'

export default async function ProductsPage() {
  try {
    // Get products and taxonomy data
    const [products, categories, priceRanges] = await Promise.all([
      getProducts(1000, 0), // Get all products (up to 1000)
      getCategories(),
      getPriceRanges()
    ])

    return (
      <div className="bg-brand-cream text-brand-dark">
        {/* Hero Section */}
        <section className="bg-white text-center py-20 border-b border-gray-200">
          <div className="container mx-auto px-4">
            <h1 className="text-5xl font-bold tracking-tight mb-4">All BIFL Products</h1>
            <p className="text-lg text-brand-gray max-w-2xl mx-auto">
              Explore our full database of durable, high-quality products. Filter by category or BIFL score to find exactly what you need.
            </p>
          </div>
        </section>

        {/* Product Grid Section */}
        <section className="py-16">
          <div className="container mx-auto px-12">
            <ProductGrid
              initialProducts={products || []}
              categories={categories || []}
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