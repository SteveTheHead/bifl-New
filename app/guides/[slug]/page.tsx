import React from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { FAQStructuredData, BreadcrumbStructuredData, ArticleStructuredData, ItemListStructuredData } from '@/components/seo/structured-data'

interface Product {
  id: string
  name: string
  slug: string
  excerpt: string | null
  featured_image_url: string | null
  price: number | null
  bifl_total_score: number | null
  durability_score: number | null
  repairability_score: number | null
  warranty_score: number | null
  sustainability_score: number | null
  social_score: number | null
  bifl_certification: string[] | null
  brand?: { name: string; slug: string }
  display_order: number
  pros: string[] | null
  cons: string[] | null
  warranty_years: number | null
  country_of_origin: string | null
}

interface BuyingCriteria {
  title: string
  description: string
  icon: string
}

interface FAQ {
  question: string
  answer: string
}

interface BuyingGuide {
  id: string
  slug: string
  title: string
  meta_title: string | null
  meta_description: string | null
  intro_content: string | null
  buying_criteria: BuyingCriteria[]
  featured_image_url: string | null
  faqs: FAQ[]
  is_published: boolean
  published_at: string | null
  products: Product[]
}

// Generate dynamic labels for all products at once to avoid duplicates
function generateProductLabels(products: Product[]): Map<string, { label: string; color: string }> {
  const labels = new Map<string, { label: string; color: string }>()
  const usedLabels = new Set<string>()

  // First product is always Top Pick
  if (products.length > 0) {
    labels.set(products[0].id, { label: 'Top Pick', color: 'bg-teal-600' })
    usedLabels.add('Top Pick')
  }

  // Find best candidate for each label type among remaining products
  const labelCriteria = [
    {
      label: 'Best Warranty',
      color: 'bg-blue-600',
      score: (p: Product) => p.warranty_years === 99 ? 100 : (p.warranty_score || 0)
    },
    {
      label: 'Most Durable',
      color: 'bg-gray-700',
      score: (p: Product) => p.durability_score || 0
    },
    {
      label: 'Crowd Favorite',
      color: 'bg-purple-600',
      score: (p: Product) => p.social_score || 0
    },
    {
      label: 'Eco-Friendly',
      color: 'bg-green-600',
      score: (p: Product) => p.sustainability_score || 0
    },
    {
      label: 'Easy to Repair',
      color: 'bg-orange-500',
      score: (p: Product) => p.repairability_score || 0
    },
    {
      label: 'Best Value',
      color: 'bg-amber-600',
      score: (p: Product) => p.price ? (1000 - p.price) / 10 : 0 // Lower price = higher score
    },
  ]

  // Assign each label to the best candidate that doesn't have a label yet
  for (const criteria of labelCriteria) {
    let bestProduct: Product | null = null
    let bestScore = 7.0 // Minimum threshold

    for (const product of products) {
      if (labels.has(product.id)) continue // Already has a label
      const score = criteria.score(product)
      if (score > bestScore) {
        bestScore = score
        bestProduct = product
      }
    }

    if (bestProduct) {
      labels.set(bestProduct.id, { label: criteria.label, color: criteria.color })
    }
  }

  // Assign "Runner Up" to any remaining products
  let runnerUpNum = 2
  for (const product of products) {
    if (!labels.has(product.id)) {
      labels.set(product.id, { label: `Pick #${runnerUpNum}`, color: 'bg-slate-600' })
      runnerUpNum++
    }
  }

  return labels
}

// Get label for a specific product (called during render)
function getProductLabel(product: Product, index: number, allProducts: Product[], labelsMap: Map<string, { label: string; color: string }>): { label: string; color: string } {
  return labelsMap.get(product.id) || { label: `Pick #${index + 1}`, color: 'bg-slate-600' }
}

async function getBuyingGuide(slug: string): Promise<BuyingGuide | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/guides/${slug}`, {
      cache: 'no-store'
    })

    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error('Failed to fetch guide')
    }

    return response.json()
  } catch (error) {
    console.error('Error fetching guide:', error)
    return null
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const guide = await getBuyingGuide(slug)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.buyitforlifeproducts.com'

  if (!guide) {
    return {
      title: 'Guide Not Found',
    }
  }

  return {
    title: guide.meta_title || guide.title,
    description: guide.meta_description || guide.intro_content?.substring(0, 160),
    openGraph: {
      title: guide.meta_title || guide.title,
      description: guide.meta_description || guide.intro_content?.substring(0, 160) || '',
      images: guide.featured_image_url ? [guide.featured_image_url] : [],
      type: 'article',
      url: `${baseUrl}/guides/${guide.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.meta_title || guide.title,
      description: guide.meta_description || guide.intro_content?.substring(0, 160) || '',
    },
    alternates: {
      canonical: `${baseUrl}/guides/${guide.slug}`,
    },
  }
}

function ScoreBar({ label, score, maxScore = 10 }: { label: string; score: number | null; maxScore?: number }) {
  const percentage = score ? (score / maxScore) * 100 : 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-brand-gray w-28 flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-teal-500 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm font-semibold text-brand-dark w-8 text-right">{score?.toFixed(1) || '-'}</span>
    </div>
  )
}

export default async function BuyingGuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const guide = await getBuyingGuide(slug)

  if (!guide) {
    notFound()
  }

  // Sort products by BIFL score (highest first)
  const sortedProducts = [...(guide.products || [])].sort((a, b) => {
    const scoreA = a.bifl_total_score || 0
    const scoreB = b.bifl_total_score || 0
    return scoreB - scoreA
  })

  // Generate unique labels for each product
  const productLabels = generateProductLabels(sortedProducts)

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.buyitforlifeproducts.com'

  return (
    <div className="min-h-screen bg-white">
      {/* Structured Data for SEO */}
      {guide.faqs && guide.faqs.length > 0 && (
        <FAQStructuredData faqs={guide.faqs} />
      )}
      <BreadcrumbStructuredData
        items={[
          { name: 'Home', url: baseUrl },
          { name: 'Buying Guides', url: `${baseUrl}/guides` },
          { name: guide.title, url: `${baseUrl}/guides/${guide.slug}` },
        ]}
      />
      <ArticleStructuredData
        article={{
          headline: guide.title,
          description: guide.meta_description || guide.intro_content?.substring(0, 160) || '',
          image: guide.featured_image_url || undefined,
          datePublished: guide.published_at || new Date().toISOString(),
          url: `${baseUrl}/guides/${guide.slug}`,
        }}
      />
      {sortedProducts.length > 0 && (
        <ItemListStructuredData
          name={guide.title}
          description={guide.meta_description || `Top ${sortedProducts.length} products in our ${guide.title} guide`}
          products={sortedProducts.map((product, index) => ({
            name: `${product.brand?.name || ''} ${product.name}`.trim(),
            url: `/products/${product.slug}`,
            image: product.featured_image_url || undefined,
            position: index + 1,
            rating: product.bifl_total_score || undefined,
            price: product.price || undefined,
          }))}
        />
      )}

      {/* Hero Section */}
      <section className="bg-gray-900 py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <Link
              href="/products"
              className="text-white/70 hover:text-white transition-colors mb-4 inline-flex items-center text-sm"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              All Products
            </Link>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white mb-4">
              {guide.title}
            </h1>
            {guide.published_at && (
              <p className="text-white/60 text-sm">
                Updated {new Date(guide.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Quick Jump Navigation */}
      {sortedProducts.length > 0 && (
        <section className="bg-gray-50 border-b border-gray-200 py-4 sticky top-16 z-40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <span className="text-sm font-medium text-brand-gray flex-shrink-0">Jump to:</span>
              {sortedProducts.slice(0, 6).map((product, index) => {
                const labelInfo = getProductLabel(product, index, sortedProducts, productLabels)
                return (
                  <a
                    key={product.id}
                    href={`#product-${index + 1}`}
                    className="flex-shrink-0 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-brand-dark hover:bg-gray-100 hover:border-gray-300 transition-colors"
                  >
                    {labelInfo.label}
                  </a>
                )
              })}
            </div>
          </div>
        </section>
      )}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Intro Content */}
          {guide.intro_content && (
            <div className="prose prose-lg max-w-none mb-12">
              {guide.intro_content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-brand-gray leading-relaxed mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          )}

          {/* Products List - Tom's Guide Style */}
          {sortedProducts.length > 0 && (
            <div className="space-y-12">
              {sortedProducts.map((product, index) => {
                const labelInfo = getProductLabel(product, index, sortedProducts, productLabels)
                const pros = Array.isArray(product.pros) ? product.pros : []
                const cons = Array.isArray(product.cons) ? product.cons : []

                return (
                  <article
                    key={product.id}
                    id={`product-${index + 1}`}
                    className="scroll-mt-32 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm"
                  >
                    {/* Product Header */}
                    <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className={`${labelInfo.color} text-white text-sm font-bold px-3 py-1 rounded-full`}>
                          {labelInfo.label}
                        </span>
                        <span className="text-sm text-brand-gray">#{index + 1} in our guide</span>
                      </div>
                    </div>

                    <div className="p-6">
                      {/* Main Content Grid */}
                      <div className="grid md:grid-cols-2 gap-8">
                        {/* Left: Image */}
                        <div className="relative">
                          <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden">
                            <Image
                              src={product.featured_image_url || '/placeholder-product.png'}
                              alt={product.name}
                              width={400}
                              height={400}
                              className="w-full h-full object-contain p-4"
                            />
                          </div>
                        </div>

                        {/* Right: Info */}
                        <div>
                          <h2 className="text-2xl font-bold text-brand-dark mb-1">
                            {product.brand?.name} {product.name}
                          </h2>

                          {/* Specs Table */}
                          <div className="mt-4 space-y-2">
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-sm text-brand-gray">Price</span>
                              <span className="text-sm font-semibold text-brand-dark">
                                {product.price ? `$${product.price}` : 'Check price'}
                              </span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-sm text-brand-gray">BIFL Score</span>
                              <span className="text-sm font-bold text-teal-600">
                                {product.bifl_total_score?.toFixed(1) || '-'} / 10
                              </span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-sm text-brand-gray">Warranty</span>
                              <span className="text-sm font-semibold text-brand-dark">
                                {product.warranty_years === 99 ? 'Lifetime' : product.warranty_years ? `${product.warranty_years} years` : '-'}
                              </span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-sm text-brand-gray">Made in</span>
                              <span className="text-sm font-semibold text-brand-dark">
                                {product.country_of_origin || '-'}
                              </span>
                            </div>
                          </div>

                          {/* CTA Button */}
                          <div className="mt-6">
                            <Link
                              href={`/products/${product.slug}`}
                              className="block w-full text-center bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                            >
                              View Full Details
                            </Link>
                          </div>
                        </div>
                      </div>

                      {/* Pros & Cons */}
                      {(pros.length > 0 || cons.length > 0) && (
                        <div className="mt-8 grid md:grid-cols-2 gap-6">
                          {/* Pros */}
                          {pros.length > 0 && (
                            <div className="bg-green-50 rounded-lg p-5">
                              <h3 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Pros
                              </h3>
                              <ul className="space-y-2">
                                {pros.map((pro, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-green-900">
                                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    {pro}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Cons */}
                          {cons.length > 0 && (
                            <div className="bg-red-50 rounded-lg p-5">
                              <h3 className="font-bold text-red-800 mb-3 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                Cons
                              </h3>
                              <ul className="space-y-2">
                                {cons.map((con, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-red-900">
                                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                    {con}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Score Breakdown */}
                      <div className="mt-8 bg-gray-50 rounded-lg p-5">
                        <h3 className="font-bold text-brand-dark mb-4">BIFL Score Breakdown</h3>
                        <div className="space-y-3">
                          <ScoreBar label="Durability" score={product.durability_score} />
                          <ScoreBar label="Repairability" score={product.repairability_score} />
                          <ScoreBar label="Warranty" score={product.warranty_score} />
                          <ScoreBar label="Sustainability" score={product.sustainability_score} />
                        </div>
                      </div>

                      {/* Excerpt/Review */}
                      {product.excerpt && (
                        <div className="mt-6">
                          <h3 className="font-bold text-brand-dark mb-2">Our Take</h3>
                          <p className="text-brand-gray leading-relaxed">{product.excerpt}</p>
                        </div>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          {/* Buying Criteria Section */}
          {guide.buying_criteria && guide.buying_criteria.length > 0 && (
            <section className="mt-16 bg-gray-50 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-brand-dark mb-6">
                What to Look For
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {guide.buying_criteria.map((criteria, index) => (
                  <div key={index} className="bg-white rounded-lg p-5 border border-gray-100">
                    <h3 className="font-semibold text-brand-dark mb-2">{criteria.title}</h3>
                    <p className="text-sm text-brand-gray">{criteria.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* FAQ Section */}
          {guide.faqs && guide.faqs.length > 0 && (
            <section className="mt-16">
              <h2 className="text-2xl font-bold text-brand-dark mb-6">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4" itemScope itemType="https://schema.org/FAQPage">
                {guide.faqs.map((faq, index) => (
                  <details
                    key={index}
                    className="group bg-gray-50 rounded-lg overflow-hidden"
                    itemScope
                    itemProp="mainEntity"
                    itemType="https://schema.org/Question"
                  >
                    <summary className="px-6 py-4 cursor-pointer list-none flex items-center justify-between hover:bg-gray-100 transition-colors">
                      <span className="font-semibold text-brand-dark pr-4" itemProp="name">
                        {faq.question}
                      </span>
                      <svg
                        className="w-5 h-5 text-brand-gray flex-shrink-0 transition-transform group-open:rotate-180"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div
                      className="px-6 pb-4"
                      itemScope
                      itemProp="acceptedAnswer"
                      itemType="https://schema.org/Answer"
                    >
                      <p className="text-brand-gray leading-relaxed" itemProp="text">
                        {faq.answer}
                      </p>
                    </div>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* CTA Section */}
          <section className="mt-16 text-center bg-gray-900 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              Ready to Buy It For Life?
            </h2>
            <p className="text-white/70 mb-6">
              Explore our complete collection of community-verified, durable products.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg transition-colors"
            >
              Browse All Products
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </section>
        </div>
      </div>
    </div>
  )
}
