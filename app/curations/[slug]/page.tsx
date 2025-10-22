import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import BadgeDisplay from '@/components/BadgeDisplay'

interface Product {
  id: string
  name: string
  slug: string
  excerpt: string | null
  featured_image_url: string | null
  price: number | null
  bifl_total_score: number | null
  star_rating: number | null
  brand?: { name: string; slug: string }
  category?: { name: string; slug: string }
}

interface CurationProduct {
  id: string
  product_id: string
  display_order: number
  products: Product
}

interface Curation {
  id: string
  name: string
  slug: string
  description: string | null
  featured_image_url: string | null
  is_active: boolean
  is_featured: boolean
  display_order: number
  created_at: string
  curation_products: CurationProduct[]
}

async function getCuration(slug: string): Promise<Curation | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/curations/${slug}`, {
      next: { revalidate: 3600 } // Revalidate every hour
    })

    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error('Failed to fetch curation')
    }

    return response.json()
  } catch (error) {
    console.error('Error fetching curation:', error)
    return null
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const curation = await getCuration(slug)

  if (!curation) {
    return {
      title: 'Curation Not Found',
    }
  }

  return {
    title: `${curation.name} - Curated Products | Buy It For Life`,
    description: curation.description || `Explore our curated collection: ${curation.name}`,
    openGraph: {
      title: `${curation.name} - Curated Products`,
      description: curation.description || `Explore our curated collection: ${curation.name}`,
      images: curation.featured_image_url ? [curation.featured_image_url] : [],
    },
  }
}

// Score badge styling function
function getScoreBadgeStyle(score: number) {
  const scoreString = score.toString()
  return {
    className: "score-field px-3 py-1 rounded-full transform transition-all duration-300",
    dataScore: scoreString
  }
}

function getScoreLabel(score: number) {
  if (score >= 9.0) return "Legend"
  if (score >= 8.0) return "Excellent"
  if (score >= 7.0) return "Good"
  if (score >= 6.0) return "Fair"
  return "Poor"
}

export default async function CurationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const curation = await getCuration(slug)

  if (!curation) {
    notFound()
  }

  // Sort products by display_order
  const sortedProducts = [...curation.curation_products].sort(
    (a, b) => a.display_order - b.display_order
  )

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Hero Section */}
      <section className="relative bg-brand-dark py-16 md:py-24">
        {curation.featured_image_url && (
          <>
            <div className="absolute inset-0">
              <Image
                src={curation.featured_image_url}
                alt={curation.name}
                fill
                className="object-cover opacity-20"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/70"></div>
          </>
        )}

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <Link
              href="/"
              className="text-white/80 hover:text-white transition-colors mb-6 inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </Link>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-6">
              {curation.name}
            </h1>
            {curation.description && (
              <p className="text-lg md:text-xl text-white/90 mb-4 max-w-3xl">
                {curation.description}
              </p>
            )}
            <p className="text-white/80">
              {sortedProducts.length} {sortedProducts.length === 1 ? 'product' : 'products'} in this collection
            </p>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {sortedProducts.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="text-xl font-semibold text-brand-dark mb-2">No products yet</h3>
              <p className="text-brand-gray">This collection is being curated. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {sortedProducts.map((cp) => {
                const product = cp.products
                const totalScore = product.bifl_total_score || 0

                return (
                  <Link key={product.id} href={`/products/${product.slug}`}>
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer h-full flex flex-col">
                      <div className="relative">
                        <Image
                          src={product.featured_image_url || '/placeholder-product.png'}
                          alt={product.name}
                          width={400}
                          height={224}
                          className="w-full h-56 object-contain"
                        />
                        <BadgeDisplay
                          product={product}
                          size="sm"
                          overlay={true}
                          className="top-3 right-3"
                        />
                      </div>
                      <div className="p-6 text-center flex-1 flex flex-col">
                        <h3 className="text-xl font-semibold text-brand-dark mb-2">{product.name}</h3>
                        {product.brand && (
                          <p className="text-brand-gray mb-2">{product.brand.name}</p>
                        )}
                        {product.excerpt && (
                          <p className="text-sm text-brand-gray mb-4 line-clamp-2">{product.excerpt}</p>
                        )}
                        <div className="mt-auto">
                          <div className="flex justify-center items-center gap-3 mb-4">
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
                          <div className="w-full text-white font-semibold py-2 px-6 rounded-lg transition-opacity cursor-pointer hover:opacity-90" style={{ backgroundColor: '#4A9D93' }}>
                            View Product
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-dark mb-6">
            Explore More Collections
          </h2>
          <p className="text-lg text-brand-gray mb-8 max-w-2xl mx-auto">
            Discover more curated collections of exceptional products that stand the test of time.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 rounded-lg text-base font-semibold transform hover:scale-105 hover:opacity-90 transition-all duration-300 shadow-lg"
            style={{ backgroundColor: '#4A9D93', color: 'white' }}
          >
            Browse All Collections
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  )
}
