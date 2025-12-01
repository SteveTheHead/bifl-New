import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import { getCategories, getFeaturedProducts, getFeaturedCurations } from '@/lib/supabase/queries'
import { Card, CardContent } from '@/components/ui/card'
import BadgeDisplay from '@/components/BadgeDisplay'
import { OrganizationStructuredData } from '@/components/seo/structured-data'
import { NewsletterSection } from '@/components/homepage/newsletter-section'
import { HeroProductCarousel } from '@/components/homepage/hero-product-carousel'

// Enable dynamic rendering (required because we use Supabase cookies)
export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Revalidate every hour

// SEO Metadata
export const metadata: Metadata = {
  title: 'Buy It For Life - Community-Verified Durable Products That Last',
  description: 'Discover 327+ community-verified products built to last. Comprehensive BIFL ratings on durability, repairability, and warranty. Find quality items worth buying once.',
  keywords: ['buy it for life', 'BIFL', 'durable products', 'lifetime warranty', 'quality products', 'sustainable shopping', 'long-lasting products'],

  openGraph: {
    title: 'Buy It For Life - Community-Verified Durable Products That Last',
    description: 'Discover 327+ community-verified products built to last. Comprehensive BIFL ratings on durability, repairability, and warranty.',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://www.buyitforlifeproducts.com',
    siteName: 'Buy It For Life',
    images: [
      {
        url: '/images/categories/hero Picture 1.png',
        width: 1200,
        height: 630,
        alt: 'Buy It For Life - Durable Products',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Buy It For Life - Community-Verified Durable Products',
    description: 'Discover 327+ community-verified products built to last. Comprehensive BIFL ratings on durability, repairability, and warranty.',
    images: ['/images/categories/hero Picture 1.png'],
  },

  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL || 'https://www.buyitforlifeproducts.com',
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
}

// Score badge styling function (matching product grid)
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

export default async function HomePage() {
  try {
    // Get categories, featured products, and featured curations from database
    console.log('[Homepage] Starting data fetch...')

    let categories: any[] = []
    let featuredProducts: any[] = []
    let featuredCurations: any[] = []

    try {
      categories = await getCategories()
      console.log('[Homepage] Categories loaded:', categories?.length || 0)
    } catch (catErr) {
      console.error('[Homepage] Categories error:', catErr)
      categories = []
    }

    try {
      featuredProducts = await getFeaturedProducts()
      console.log('[Homepage] Featured products loaded:', featuredProducts?.length || 0)
    } catch (prodErr) {
      console.error('[Homepage] Featured products error:', prodErr)
      featuredProducts = []
    }

    try {
      featuredCurations = await getFeaturedCurations()
      console.log('[Homepage] Curations loaded:', featuredCurations?.length || 0)
    } catch (curErr) {
      console.error('[Homepage] Curations error:', curErr)
      featuredCurations = []
    }

    console.log('[Homepage] All data loaded successfully')

  return (
    <div className="bg-brand-cream font-sans">
      {/* SEO Structured Data */}
      <OrganizationStructuredData />

      {/* Hero Section */}
      <section className="relative h-[500px] sm:h-[550px] md:h-[600px] lg:h-[650px] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/categories/hero Picture 1.png"
            alt="high quality leather boots vintage tools compass on wooden surface dark moody lighting"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 h-full flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 w-full items-center">
            {/* Left Column - Content */}
            <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif font-bold text-white mb-4 sm:mb-6 leading-tight">
              Buy Better. <span className="text-yellow-500">Once.</span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 mb-6 sm:mb-8 max-w-3xl leading-relaxed">
              Buy It For Life products verified for durability, repairability, and real-world performance. Every recommendation backed by years of actual use from real owners.
            </p>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6 lg:gap-8 mb-6 sm:mb-8">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="#4A9D93" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-white font-medium text-sm sm:text-base">Community-Verified</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="#4A9D93" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-white font-medium text-sm sm:text-base">Real User Experience</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="#4A9D93" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-white font-medium text-sm sm:text-base">No Bias</span>
              </div>
            </div>

            {/* Quality Badges */}
            <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-10">
              <Link href="/products?badge=Gold%20Standard" className="inline-block">
                <BadgeDisplay certification="Gold Standard" size="sm" />
              </Link>
              <Link href="/products?badge=Crowd%20Favorite" className="inline-block">
                <BadgeDisplay certification="Crowd Favorite" size="sm" />
              </Link>
              <Link href="/products?badge=Lifetime%20Warranty" className="inline-block">
                <BadgeDisplay certification="Lifetime Warranty" size="sm" />
              </Link>
              <Link href="/products?badge=Repair%20Friendly" className="inline-block">
                <BadgeDisplay certification="Repair Friendly" size="sm" />
              </Link>
            </div>
          </div>

          {/* Right Column - Product Carousel */}
          <div className="hidden lg:block">
            <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-5 max-w-sm mx-auto">
              {featuredProducts && featuredProducts.length > 0 && (
                <HeroProductCarousel products={featuredProducts.slice(0, 6)} />
              )}
            </div>

            {/* Browse Products Button */}
            <div className="text-center mt-6">
              <Link
                href="/products"
                className="inline-flex items-center text-white px-6 py-3 rounded-lg text-base font-semibold hover:bg-opacity-90 transform hover:scale-105 transition-all duration-300 shadow-lg"
                style={{ backgroundColor: '#4A9D93' }}
              >
                Browse Products
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
        </div>

      </section>

      {/* Trust Methodology Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-brand-dark mb-6">Our Curation Process</h2>
            <p className="text-xl text-brand-gray max-w-3xl mx-auto">
              We collect and verify real-world user experiences - but only products that truly prove their worth make it to our recommendations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Multi-Source Verification */}
            <div className="bg-brand-cream p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-transparent rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8" fill="none" stroke="#4A9D93" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-brand-dark mb-4">Multi-Source Verification</h3>
              <p className="text-brand-gray">
                We verify every product through manufacturer warranties, long-term user reviews, repair policies, and material quality analysis. No single source decides - the data does.
              </p>
            </div>

            {/* Community-Sourced */}
            <div className="bg-brand-cream p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-transparent rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8" fill="none" stroke="#4A9D93" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-brand-dark mb-4">Community-Sourced</h3>
              <p className="text-brand-gray">
                Our recommendations come from the 2.6M+ Buy It For Life community, sustainability forums, and real owners who've tested products for years, sometimes decades.
              </p>
            </div>

            {/* Quality First, Always */}
            <div className="bg-brand-cream p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-transparent rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8" fill="none" stroke="#4A9D93" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-brand-dark mb-4">Quality First, Always</h3>
              <p className="text-brand-gray">
                Every product is evaluated on merit alone - durability, repairability, and real-world performance. We curate and verify everything we can, but only recommend products that truly earn it. Affiliate earnings simply help keep this service free.
              </p>
            </div>

            {/* Living Database */}
            <div className="bg-brand-cream p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-transparent rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8" fill="none" stroke="#4A9D93" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-brand-dark mb-4">Living Database</h3>
              <p className="text-brand-gray">
                Quality changes? We update immediately. When trusted brands decline or new champions emerge, our listings reflect reality, not outdated assumptions.
              </p>
            </div>
          </div>

          {/* Learn More Button */}
          <div className="text-center mt-12">
            <Link
              href="/how-it-works"
              className="inline-flex items-center text-white px-6 py-3 rounded-lg text-base font-semibold hover:bg-opacity-90 transform hover:scale-105 transition-all duration-300 shadow-lg"
              style={{ backgroundColor: '#4A9D93' }}
            >
              Learn More
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>


      {/* Category Grid Section - Dynamic */}
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-brand-dark mb-4 sm:mb-6">Shop by Category</h2>
            <p className="text-base sm:text-lg md:text-xl text-brand-gray max-w-3xl mx-auto px-4">
              Explore our carefully curated categories of durable goods, each containing only the finest products that have stood the test of time.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {categories?.map((category) => {
              // Map category names to local images
              const categoryImageMap: Record<string, string> = {
                'Footwear & Accessories': '/images/categories/Footwear.png',
                'Tools & Hardware': '/images/categories/Tools.png',
                'Home & Kitchen': '/images/categories/Home & Kitchen.png',
                'Outdoor & Camping': '/images/categories/Outdoor and camping.png',
                'Clothing & Apparel': '/images/categories/clothing.png',
                'Travel & Everyday Carry': '/images/categories/everyday carry.png',
                'Electronics & Tech': '/images/categories/electronics and tech.png',
                'Automotive & Cycling': '/images/categories/automotivecycling.png'
              }

              const imageUrl = categoryImageMap[category.name] || '/images/categories/Home & Kitchen.png'

              return (
                <Link key={category.id} href={`/products?categories=${category.id}`}>
                  <div className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer">
                    <Image
                      src={imageUrl}
                      alt={`${category.name.toLowerCase()} products`}
                      width={400}
                      height={256}
                      className="w-full h-48 sm:h-56 md:h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all duration-300"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 z-10">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-4">{category.name}</h3>
                      <span className="inline-block text-white px-3 py-1.5 rounded-lg font-medium hover:bg-opacity-90 transition-colors cursor-pointer relative z-20 border-2 text-xs sm:text-sm" style={{ backgroundColor: '#4A9D93', borderColor: '#4A9D93' }}>
                        View Products
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Products Section - Dynamic */}
      <section className="py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-brand-dark mb-4 sm:mb-6">Featured Products</h2>
            <p className="text-base sm:text-lg md:text-xl text-brand-gray max-w-3xl mx-auto px-4">
              Our top-rated products that have earned the highest community ratings and longest durability records.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {featuredProducts?.map((product: any) => {
              const totalScore = product.bifl_total_score || 0

              return (
                <Link key={product.id} href={`/products/${product.slug}`}>
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
                    <div className="relative">
                      <Image
                        src={product.featured_image_url || '/placeholder-product.png'}
                        alt={product.name || 'Product'}
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
                    <div className="p-6 text-center">
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
                      <div className="block text-white font-semibold py-2 px-6 rounded-lg hover:bg-opacity-90 transition-colors cursor-pointer" style={{ backgroundColor: '#4A9D93' }}>
                        View Product
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Curations Section */}
      {featuredCurations && featuredCurations.length > 0 && (
        <section className="py-12 sm:py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-12 md:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-brand-dark mb-4 sm:mb-6">Curated Collections</h2>
              <p className="text-base sm:text-lg md:text-xl text-brand-gray max-w-3xl mx-auto px-4">
                Community-verified collections for every occasion, from holiday gifts to seasonal essentials.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {featuredCurations.map((curation: any) => (
                <Link key={curation.id} href={`/curations/${curation.slug}`}>
                  <div className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer bg-white">
                    {curation.featured_image_url ? (
                      <>
                        <Image
                          src={curation.featured_image_url}
                          alt={curation.name}
                          width={400}
                          height={256}
                          className="w-full h-48 sm:h-56 md:h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all duration-300"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                      </>
                    ) : (
                      <div className="w-full h-48 sm:h-56 md:h-64 bg-gradient-to-br from-brand-teal to-brand-dark"></div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 z-10">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2">{curation.name}</h3>
                      {curation.description && (
                        <p className="text-white/90 text-sm mb-3 line-clamp-2">{curation.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-white/80 text-sm">{curation.product_count} products</span>
                        <span className="inline-block text-white px-3 py-1.5 rounded-lg font-medium hover:bg-opacity-90 transition-colors cursor-pointer relative z-20 border-2 text-xs sm:text-sm" style={{ backgroundColor: '#4A9D93', borderColor: '#4A9D93' }}>
                          View Collection
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter Section */}
      <NewsletterSection />

    </div>
  )
  } catch (error) {
    // Log the full error for debugging
    console.error('Homepage loading error:', error)
    console.error('Error type:', typeof error)
    console.error('Error details:', JSON.stringify(error, null, 2))

    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-cream to-white">
        <div className="container mx-auto py-12">
          <Card className="border-red-500 bg-white shadow-lg rounded-2xl max-w-2xl mx-auto">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-red-500/10 rounded-full flex items-center justify-center">
                <div className="w-10 h-10 bg-red-500/20 rounded-full"></div>
              </div>
              <h3 className="text-2xl font-bold text-red-600 mb-3">
                Failed to load homepage
              </h3>
              <p className="text-brand-gray">
                {error instanceof Error ? error.message : 'Unknown error occurred'}
              </p>
              {process.env.NODE_ENV === 'development' && (
                <pre className="mt-4 text-xs text-left bg-gray-100 p-4 rounded overflow-auto max-h-64">
                  {JSON.stringify(error, null, 2)}
                </pre>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
}