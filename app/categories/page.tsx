import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { CategoryGrid } from '@/components/categories/category-grid'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Browse All Categories - BIFL Products',
  description: 'Explore all product categories and find the best Buy It For Life products that last a lifetime. From electronics to home goods, discover durable products with expert reviews.',
  keywords: [
    'categories',
    'buy it for life',
    'BIFL products',
    'durable goods',
    'long lasting products',
    'product categories',
    'quality products'
  ].join(', '),
  openGraph: {
    title: 'Browse All Categories - Buy It For Life Products',
    description: 'Explore all product categories and find the best Buy It For Life products that last a lifetime.',
    type: 'website',
    siteName: 'BIFL Products',
    url: 'https://bifl.com/categories',
    images: [
      {
        url: '/og-image-categories.jpg',
        width: 1200,
        height: 630,
        alt: 'Browse all BIFL product categories'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Browse All Categories - Buy It For Life Products',
    description: 'Explore all product categories and find the best Buy It For Life products that last a lifetime.',
    images: ['/og-image-categories.jpg']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://bifl.com/categories'
  }
}

export default async function CategoriesPage() {
  const supabase = await createClient()

  // Get all categories with product counts
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true })

  if (categoriesError) {
    console.error('Error fetching categories:', categoriesError)
  }

  // Get product counts for each category
  const categoryIds = categories?.map((c: any) => c.id) || []
  let productCounts = null

  if (categoryIds.length > 0) {
    const { data } = await supabase
      .from('products')
      .select('category_id')
      .eq('status', 'published')
      .in('category_id', categoryIds)
    productCounts = data
  }

  // Count products per category
  const countsByCategory = productCounts?.reduce((acc: any, product: any) => {
    acc[product.category_id] = (acc[product.category_id] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  // Transform categories to include product counts
  const categoriesWithCounts = (categories || []).map((category: any) => ({
    ...category,
    productCount: countsByCategory[category.id] || 0
  }))

  // Separate featured and regular categories
  const featuredCategories = categoriesWithCounts.filter(c => c.is_featured)
  const regularCategories = categoriesWithCounts.filter(c => !c.is_featured)

  // Generate structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Product Categories - Buy It For Life",
    "description": "Browse all product categories to find durable, long-lasting products built for life",
    "url": "https://bifl.com/categories",
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
        }
      ]
    },
    "hasPart": categoriesWithCounts.slice(0, 12).map((category) => ({
      "@type": "ItemList",
      "name": category.name,
      "description": category.description || `Discover the best ${category.name} products built to last`,
      "url": `https://bifl.com/categories/${category.slug}`,
      "numberOfItems": category.productCount
    }))
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-brand-dark mb-6">
              Browse All Categories
            </h1>
            <p className="text-lg text-brand-gray max-w-3xl mx-auto leading-relaxed">
              Discover products built to last a lifetime across all categories.
              From kitchen essentials to outdoor gear, find durable items with
              expert reviews and detailed BIFL ratings.
            </p>
          </div>

          <Suspense fallback={
            <div className="animate-pulse">
              <div className="mb-12">
                <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg p-6 border border-gray-200">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg mb-4"></div>
                      <div className="h-6 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg p-6 border border-gray-200">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg mb-4"></div>
                      <div className="h-6 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          }>
            {/* Featured Categories */}
            {featuredCategories.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-brand-dark mb-6">
                  Featured Categories
                </h2>
                <CategoryGrid categories={featuredCategories} featured />
              </div>
            )}

            {/* All Categories */}
            <div>
              <h2 className="text-2xl font-bold text-brand-dark mb-6">
                All Categories
              </h2>
              <CategoryGrid categories={regularCategories} />
            </div>

            {/* Stats */}
            <div className="mt-16 bg-white rounded-lg border border-gray-200 p-8">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-brand-dark mb-4">
                  Why Choose BIFL Products?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <div className="text-3xl font-bold text-brand-teal mb-2">
                      {categoriesWithCounts.length}+
                    </div>
                    <div className="text-brand-gray">Product Categories</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-brand-teal mb-2">
                      {categoriesWithCounts.reduce((sum, cat) => sum + cat.productCount, 0)}+
                    </div>
                    <div className="text-brand-gray">Reviewed Products</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-brand-teal mb-2">
                      Expert
                    </div>
                    <div className="text-brand-gray">Reviews & Ratings</div>
                  </div>
                </div>
              </div>
            </div>
          </Suspense>
        </div>
      </div>
    </>
  )
}