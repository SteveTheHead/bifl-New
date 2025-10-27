import { Suspense } from 'react'
import { createClient, createBuildClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { CategoryPageClient } from '@/components/categories/category-page-client'
import { Metadata } from 'next'

interface CategoryPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateStaticParams() {
  const supabase = createBuildClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('slug')
    .limit(500)

  return (categories || []).map((category: { slug: string }) => ({
    slug: category.slug,
  }))
}

export async function generateMetadata({ params, searchParams }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: category } = await supabase
    .from('categories')
    .select('id, name, description')
    .eq('slug', slug)
    .single()

  if (!category) {
    return {
      title: 'Category Not Found',
      description: 'The requested category could not be found.',
      robots: {
        index: false,
        follow: false,
      }
    }
  }

  // Get product count for this category
  const { count: productCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', (category as any).id)
    .eq('status', 'published')

  const categoryName = (category as any).name
  const title = `Best ${categoryName} 2024 - BIFL Buying Guide & Reviews`
  const description = (category as any).description ||
    `Discover the ${productCount || 'best'} highest-rated ${categoryName.toLowerCase()} products built to last a lifetime. Expert reviews, AI-generated buying guides, and detailed BIFL ratings. Find durable, repairable ${categoryName.toLowerCase()} with strong warranties.`

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://buyitforlife.com'
  const canonicalUrl = `${baseUrl}/categories/${slug}`

  // Check if this is a filtered/sorted view - if so, prevent indexing
  const params_resolved = await searchParams
  const hasFilters = params_resolved.sort || params_resolved.price_min || params_resolved.price_max || params_resolved.brand
  const shouldIndex = !hasFilters

  return {
    title,
    description,
    keywords: [
      categoryName.toLowerCase(),
      'buy it for life',
      'BIFL',
      'durable',
      'long lasting',
      'reviews',
      'buying guide',
      'best quality',
      'repairable',
      'warranty'
    ].join(', '),
    openGraph: {
      title: `Best ${categoryName} - Buy It For Life Products`,
      description,
      type: 'website',
      siteName: 'Buy It For Life',
      url: `${baseUrl}/categories/${slug}`,
      images: [
        {
          url: '/og-image-category.jpg',
          width: 1200,
          height: 630,
          alt: `Best ${categoryName} products that last a lifetime`
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image-category.jpg']
    },
    robots: {
      index: shouldIndex,
      follow: true,
      googleBot: {
        index: shouldIndex,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: canonicalUrl, // Always point to clean URL without filters
    },
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params
  const { sort, price_min, price_max, brand } = await searchParams

  const supabase = await createClient()

  // Get category details
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('*, show_buying_guide')
    .eq('slug', slug)
    .single()

  if (categoryError || !category) {
    notFound()
  }

  // Get all categories to find subcategories
  const { data: allCategories } = await supabase
    .from('categories')
    .select('*')

  // Helper function to get all subcategory IDs for a category
  const getSubcategoryIds = (categoryId: string): string[] => {
    const subcategories = (allCategories || []).filter((c: any) => c.parent_id === categoryId)
    const subcategoryIds = subcategories.map((c: any) => c.id)

    // Recursively get subcategories of subcategories
    const nestedSubcategoryIds = subcategoryIds.flatMap(id => getSubcategoryIds(id))

    return [...subcategoryIds, ...nestedSubcategoryIds]
  }

  // Get all category IDs to include (category + all subcategories)
  const categoryId = (category as any).id
  const allCategoryIds = [categoryId, ...getSubcategoryIds(categoryId)]

  // Get subcategories for display
  const subcategories = (allCategories || []).filter((c: any) => c.parent_id === categoryId)

  // Build products query with filters - include products from category and subcategories
  let query = supabase
    .from('products')
    .select(`
      *,
      brands(name, slug),
      categories(name, slug)
    `)
    .in('category_id', allCategoryIds)
    .eq('status', 'published')

  // Apply filters
  if (price_min) {
    query = query.gte('price', parseInt(price_min as string))
  }
  if (price_max) {
    query = query.lte('price', parseInt(price_max as string))
  }
  // Note: Brand filtering would need a separate approach without inner join
  // For now, we'll filter client-side in the transform step

  // Apply sorting
  switch (sort) {
    case 'price_asc':
      query = query.order('price', { ascending: true })
      break
    case 'price_desc':
      query = query.order('price', { ascending: false })
      break
    case 'rating':
      query = query.order('bifl_total_score', { ascending: false })
      break
    case 'newest':
      query = query.order('created_at', { ascending: false })
      break
    default:
      query = query.order('bifl_total_score', { ascending: false })
  }

  const { data: products, error: productsError } = await query

  if (productsError) {
    console.error('Error fetching products:', productsError)
  }

  // Transform products data
  let transformedProducts = (products || []).map((product: any) => ({
    ...product,
    brand_name: product.brands?.name,
    brand_slug: product.brands?.slug,
    category_name: product.categories?.name,
    category_slug: product.categories?.slug
  }))

  // Apply client-side brand filtering
  if (brand) {
    transformedProducts = transformedProducts.filter(product =>
      product.brand_slug === brand
    )
  }

  // Get available brands for filtering
  const { data: availableBrands } = await supabase
    .from('products')
    .select('brand_id, brands(name, slug)')
    .eq('category_id', (category as any).id)
    .eq('status', 'published')
    .not('brand_id', 'is', null)

  const uniqueBrands = Array.from(
    new Map(
      (availableBrands || [])
        .filter((p: any) => p.brands)
        .map((p: any) => [p.brands.slug, p.brands])
    ).values()
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white p-4 rounded-lg">
                      <div className="h-48 bg-gray-200 rounded mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-4 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }>
        <CategoryPageClient
          category={category}
          products={transformedProducts}
          availableBrands={uniqueBrands}
          subcategories={subcategories}
          initialFilters={{
            sort: sort as string,
            price_min: price_min as string,
            price_max: price_max as string,
            brand: brand as string
          }}
        />
      </Suspense>
    </div>
  )
}