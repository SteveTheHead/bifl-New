import React from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import BadgeDisplay from '@/components/BadgeDisplay'
import { FAQStructuredData, BreadcrumbStructuredData } from '@/components/seo/structured-data'

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

async function getBuyingGuide(slug: string): Promise<BuyingGuide | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/guides/${slug}`, {
      next: { revalidate: 3600 }
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

function getScoreBadgeStyle(score: number) {
  return {
    className: "score-field px-3 py-1 rounded-full transform transition-all duration-300",
    dataScore: score.toString()
  }
}

function getScoreLabel(score: number) {
  if (score >= 9.0) return "Legend"
  if (score >= 8.0) return "Excellent"
  if (score >= 7.0) return "Good"
  if (score >= 6.0) return "Fair"
  return "Poor"
}

function getCriteriaIcon(icon: string) {
  const icons: Record<string, React.ReactNode> = {
    fabric: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
    stitch: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4l4 4m0-4l-4 4m12-4l4 4m0-4l-4 4M4 16l4 4m0-4l-4 4m12-4l4 4m0-4l-4 4" />
      </svg>
    ),
    zipper: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m-4-8l4-4 4 4" />
      </svg>
    ),
    repair: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    warranty: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  }
  return icons[icon] || icons.fabric
}

export default async function BuyingGuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const guide = await getBuyingGuide(slug)

  if (!guide) {
    notFound()
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.buyitforlifeproducts.com'

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Structured Data */}
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

      {/* Hero Section */}
      <section className="relative bg-brand-dark py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60"></div>
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <Link
              href="/products"
              className="text-white/80 hover:text-white transition-colors mb-6 inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Products
            </Link>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-6">
              {guide.title}
            </h1>
            {guide.published_at && (
              <p className="text-white/70 text-sm">
                Updated {new Date(guide.published_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Intro Content */}
      {guide.intro_content && (
        <section className="py-12 md:py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <div className="prose prose-lg max-w-none text-brand-gray">
                {guide.intro_content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-6 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Buying Criteria Section */}
      {guide.buying_criteria && guide.buying_criteria.length > 0 && (
        <section className="py-12 md:py-16 bg-brand-cream">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-dark mb-4">
                What to Look For
              </h2>
              <p className="text-lg text-brand-gray max-w-2xl mx-auto">
                Key factors we evaluate when selecting BIFL-worthy backpacks
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {guide.buying_criteria.map((criteria, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="w-14 h-14 bg-brand-teal/10 rounded-lg flex items-center justify-center mb-4 text-brand-teal">
                    {getCriteriaIcon(criteria.icon)}
                  </div>
                  <h3 className="text-xl font-semibold text-brand-dark mb-3">
                    {criteria.title}
                  </h3>
                  <p className="text-brand-gray leading-relaxed">
                    {criteria.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products Section */}
      {guide.products && guide.products.length > 0 && (
        <section className="py-12 md:py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-dark mb-4">
                Our Top Picks
              </h2>
              <p className="text-lg text-brand-gray max-w-2xl mx-auto">
                {guide.products.length} community-verified products that meet our BIFL standards
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {guide.products.map((product, index) => {
                const totalScore = product.bifl_total_score || 0

                return (
                  <Link key={product.id} href={`/products/${product.slug}`}>
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer h-full flex flex-col border border-gray-100">
                      <div className="relative">
                        {index < 3 && (
                          <div className="absolute top-3 left-3 z-10 bg-brand-dark text-white text-xs font-bold px-2 py-1 rounded">
                            #{index + 1}
                          </div>
                        )}
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
                            View Details
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      {guide.faqs && guide.faqs.length > 0 && (
        <section className="py-12 md:py-16 bg-brand-cream">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-dark mb-4">
                  Frequently Asked Questions
                </h2>
              </div>
              <div className="space-y-4" itemScope itemType="https://schema.org/FAQPage">
                {guide.faqs.map((faq, index) => (
                  <details
                    key={index}
                    className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                    itemScope
                    itemProp="mainEntity"
                    itemType="https://schema.org/Question"
                  >
                    <summary className="px-6 py-4 cursor-pointer list-none flex items-center justify-between hover:bg-gray-50 transition-colors">
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
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-dark mb-6">
            Ready to Buy It For Life?
          </h2>
          <p className="text-lg text-brand-gray mb-8 max-w-2xl mx-auto">
            Explore our complete collection of community-verified, durable products.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center px-6 py-3 rounded-lg text-base font-semibold transform hover:scale-105 hover:opacity-90 transition-all duration-300 shadow-lg"
            style={{ backgroundColor: '#4A9D93', color: 'white' }}
          >
            Browse All Products
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  )
}
