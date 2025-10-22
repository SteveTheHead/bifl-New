'use client'

import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { SiAmazon, SiReddit, SiGoogle } from 'react-icons/si'
import { useState, useEffect } from 'react'
import { useRecentlyViewed } from '@/lib/hooks/use-recently-viewed'
import { SimilarProductsCarousel } from './similar-products-carousel'
import { ReviewForm } from '../reviews/review-form'
import { ReviewsList } from '../reviews/reviews-list'
import { FavoriteButtonWithText } from '../favorites/favorite-button'
import BadgeDisplay from '@/components/BadgeDisplay'
import { ProductProsCons } from './product-pros-cons'
import { AddToCompareButton } from '@/components/compare/add-to-compare-button'
import { ProductComparisonTable } from './product-comparison-table'
import { ProductFAQ } from './product-faq'
import { ProductCareMaintenance } from './product-care-maintenance'
import { trackProductView, trackAffiliateClick } from '@/lib/analytics'
import { FeedbackModal } from '@/components/feedback-modal'

// Get gradient pill styling based on BIFL score
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

// Render HTML content safely with custom styling
function renderHTMLContent(htmlContent: string | null): React.JSX.Element | null {
  if (!htmlContent) return null

  // Basic sanitization and styling enhancement
  const styledHTML = htmlContent
    // Style paragraphs
    .replace(/<p>/g, '<p class="mb-3">')
    // Style lists with proper spacing
    .replace(/<ul>/g, '<ul class="my-4 space-y-2">')
    .replace(/<ol>/g, '<ol class="my-4 space-y-2 pl-6">')
    // Style list items with custom bullets and flexbox
    .replace(/<li>/g, '<li style="display: flex; align-items: flex-start;"><span style="color: #4A9D93; margin-right: 8px; margin-top: 4px; flex-shrink: 0;">•</span><span>')
    .replace(/<\/li>/g, '</span></li>')
    // Style strong/bold text
    .replace(/<strong>/g, '<strong class="font-bold text-brand-dark">')
    // Style breaks
    .replace(/<br\s*\/?>/g, '<div class="my-2"></div>')

  return (
    <div
      className="prose prose-sm max-w-none"
      dangerouslySetInnerHTML={{ __html: styledHTML }}
    />
  )
}

interface Product {
  id: string
  name: string
  slug?: string
  featured_image_url?: string | null
  gallery_images?: string[] | null
  price?: number | string | null
  bifl_total_score?: number | null
  durability_score?: number | null
  repairability_score?: number | null
  warranty_score?: number | null
  social_score?: number | null
  sustainability_score?: number | null
  brands?: {
    name?: string
    slug?: string
    website?: string
    description?: string
  }
  categories?: {
    name?: string
    slug?: string
    description?: string
  }
  wordpress_meta?: {
    brand_name?: string
    category_name?: string
  }
  optimized_product_description?: string | null
  verdict_summary?: string | null
  description?: string | null
  excerpt?: string | null
  dimensions?: string | null
  lifespan_expectation?: number | null
  primary_material?: string | null
  country_of_origin?: string | null
  manufacturing_notes?: string | null
  verdict_bullets?: string[] | string | null
  repairability_notes?: string | null
  durability_notes?: string | null
  warranty_notes?: string | null
  warranty_years?: number | null
  social_notes?: string | null
  care_and_maintenance?: any | null
  affiliate_link?: string | null
  images?: string[]
  category?: string | null
  category_id?: string | null
}

interface ProductDetailViewProps {
  product: Product
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const totalScore = product.bifl_total_score || 0
  const scoreBadge = getScoreBadgeStyle(totalScore)

  // Gallery state
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [reviewRefreshTrigger, setReviewRefreshTrigger] = useState(0)

  // Newsletter form state
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [newsletterMessage, setNewsletterMessage] = useState('')

  // Feedback modal state
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false)

  // Recently viewed tracking
  const { addToRecentlyViewed } = useRecentlyViewed()

  // Track this product view
  useEffect(() => {
    if (product?.id) {
      addToRecentlyViewed(product.id)
      // Track product view in Google Analytics
      trackProductView(
        product.id,
        product.name,
        product.categories?.name || product.wordpress_meta?.category_name
      )
    }
  }, [product?.id, product.name])

  // Create gallery images array from actual gallery data
  const galleryImages = (() => {
    const images = []

    // Add featured image first if it exists
    if (product.featured_image_url) {
      images.push({
        url: product.featured_image_url,
        alt: `${product.name} - Main view`,
        caption: "Main product view"
      })
    }

    // Add gallery images from CSV column S if they exist
    if (product.gallery_images && Array.isArray(product.gallery_images)) {
      product.gallery_images.forEach((imageUrl: string, index: number) => {
        if (imageUrl && imageUrl.trim() && imageUrl !== product.featured_image_url) {
          images.push({
            url: imageUrl.trim(),
            alt: `${product.name} - Gallery image ${index + 1}`,
            caption: `Gallery view ${index + 1}`
          })
        }
      })
    }

    return images
  })()

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)
  }

  const goToImage = (index: number) => {
    setCurrentImageIndex(index)
  }

  // Newsletter submission handler
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newsletterEmail) {
      setNewsletterStatus('error')
      setNewsletterMessage('Please enter your email address')
      return
    }

    setNewsletterStatus('loading')

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newsletterEmail
        })
      })

      const data = await response.json()

      if (response.ok) {
        setNewsletterStatus('success')
        setNewsletterMessage(data.message || 'Thanks for subscribing!')
        setNewsletterEmail('')
      } else {
        setNewsletterStatus('error')
        setNewsletterMessage(data.message || 'Failed to subscribe. Please try again.')
      }
    } catch (error) {
      setNewsletterStatus('error')
      setNewsletterMessage('An error occurred. Please try again.')
    }
  }

  return (
    <div className="bg-brand-cream text-brand-dark min-h-screen">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-12 xl:gap-16 items-start">

          {/* Product Information - Left Column */}
          <div className="lg:col-span-2 space-y-10">
            {/* Product Header */}
            <section>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">{product.name}</h1>
              <p className="text-base sm:text-lg text-brand-gray mb-4">{product.brands?.name || product.wordpress_meta?.brand_name || 'Unknown Brand'}</p>
              <p className="text-sm sm:text-base text-brand-gray leading-relaxed mb-6">
                {product.optimized_product_description || product.verdict_summary || product.description || product.excerpt || 'No description available for this product.'}
              </p>

              {/* Product Specifications */}
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="text-sm font-bold text-brand-dark mb-4 uppercase tracking-wide">Product Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start">
                      <strong className="w-28 font-medium text-brand-dark shrink-0">Dimensions:</strong>
                      <span className="text-brand-gray">{product.dimensions || 'N/A'}</span>
                    </div>
                    <div className="flex items-start">
                      <strong className="w-28 font-medium text-brand-dark shrink-0">Lifespan:</strong>
                      <span className="text-brand-gray">{product.lifespan_expectation ? `${product.lifespan_expectation}+ years` : 'N/A'}</span>
                    </div>
                    <div className="flex items-start">
                      <strong className="w-28 font-medium text-brand-dark shrink-0">Material:</strong>
                      <span className="text-brand-gray">{product.primary_material || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start">
                      <strong className="w-36 font-medium text-brand-dark shrink-0">Country of Origin:</strong>
                      <span className="text-brand-gray">{product.country_of_origin || 'Unknown'}</span>
                    </div>
                    {product.manufacturing_notes && (
                      <div className="flex items-start">
                        <strong className="w-36 font-medium text-brand-dark shrink-0">Manufacturing:</strong>
                        <span className="text-brand-gray leading-relaxed">{product.manufacturing_notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Research Summary */}
            <section className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6">Research Summary</h2>
              <div className="space-y-6 text-brand-gray leading-relaxed">
                {product.verdict_summary ? (
                  <div className="space-y-4">
                    <p className="text-base text-brand-dark">{product.verdict_summary}</p>
                    {product.verdict_bullets && (
                      <ul className="space-y-3 text-sm text-brand-dark">
                        {(() => {
                          // Check if verdict_bullets is already an array (parsed by Supabase)
                          if (Array.isArray(product.verdict_bullets)) {
                            return product.verdict_bullets
                              .filter((bullet: string) => bullet && bullet.trim())
                              .map((bullet: string, index: number) => {
                                // Clean up any leading/trailing quotes and extra formatting
                                const cleanBullet = bullet.trim()
                                  .replace(/^["']+|["']+$/g, '') // Remove leading/trailing quotes
                                  .replace(/^,+|,+$/g, '')        // Remove leading/trailing commas
                                  .trim()

                                return (
                                  <li key={index} className="flex items-start leading-relaxed">
                                    <span style={{ color: '#4A9D93' }} className="mr-2 mt-1 shrink-0">•</span>
                                    <span className="font-semibold">{cleanBullet}</span>
                                  </li>
                                )
                              })
                          }

                          try {
                            // Try JSON parsing for string data
                            const bullets = JSON.parse(product.verdict_bullets)
                            return bullets
                              .filter((bullet: string) => bullet && bullet.trim())
                              .map((bullet: string, index: number) => {
                                // Clean up any leading/trailing quotes and extra formatting
                                const cleanBullet = bullet.trim()
                                  .replace(/^["']+|["']+$/g, '') // Remove leading/trailing quotes
                                  .replace(/^,+|,+$/g, '')        // Remove leading/trailing commas
                                  .trim()

                                return (
                                  <li key={index} className="flex items-start leading-relaxed">
                                    <span style={{ color: '#4A9D93' }} className="mr-2 mt-1 shrink-0">•</span>
                                    <span className="font-semibold">{cleanBullet}</span>
                                  </li>
                                )
                              })
                          } catch (error) {
                            // If JSON fails, try to handle malformed JSON or plain text
                            const rawText = String(product.verdict_bullets || '')

                            // Try multiple repair strategies for malformed JSON
                            let bullets: string[] = []

                            // Strategy 1: Fix JSON with proper quote escaping
                            try {
                              // Look for array-like structure and extract the content
                              const arrayMatch = rawText.match(/^\s*\[(.*)\]\s*$/)
                              if (arrayMatch) {
                                const content = arrayMatch[1]
                                // Split by quotes, comma, quotes pattern while preserving content
                                const items = []
                                let current = ''
                                let inQuotes = false
                                let i = 0

                                while (i < content.length) {
                                  const char = content[i]

                                  if (char === '"' && (i === 0 || content[i-1] !== '\\')) {
                                    if (!inQuotes) {
                                      inQuotes = true
                                      current = ''
                                    } else {
                                      // End of quoted string
                                      if (current.trim()) {
                                        items.push(current.trim())
                                      }
                                      inQuotes = false
                                      current = ''
                                      // Skip past comma and whitespace
                                      while (i + 1 < content.length && /[,\s]/.test(content[i + 1])) {
                                        i++
                                      }
                                    }
                                  } else if (inQuotes) {
                                    current += char
                                  }
                                  i++
                                }

                                if (items.length > 0) {
                                  bullets = items
                                }
                              }
                            } catch (repairError) {
                              // Strategy 2: Fallback to regex-based splitting
                              try {
                                const cleanText = rawText
                                  .replace(/^\s*\[|\]\s*$/g, '')  // Remove array brackets
                                  .replace(/\\"/g, '"')           // Unescape quotes

                                // Split by patterns that typically separate bullets
                                bullets = cleanText
                                  .split(/",\s*"/)
                                  .map(bullet => bullet.replace(/^["']+|["']+$/g, '').trim())
                                  .filter(bullet => bullet.length > 10)
                              } catch (finalError) {
                                // Strategy 3: Manual text splitting
                                bullets = rawText
                                  .replace(/^\s*\[|\]\s*$/g, '')
                                  .replace(/["""'']/g, '')
                                  .split(/(?<=\.)\s*(?=[A-Z])|(?=Reddit consensus)|(?=At \$)|(?=Lifetime warranty)|(?=Completely restorable)|(?=Multi-generational)|(?=Perfect for)/)
                                  .filter(bullet => {
                                    const cleaned = bullet.trim()
                                    return cleaned.length > 10 && !cleaned.match(/^[\[\],\s]*$/)
                                  })
                                  .map(bullet => bullet.trim().replace(/^[,\s]+|[,\s]+$/g, ''))
                              }
                            }

                            return bullets.map((bullet: string, index: number) => {
                              const cleanBullet = bullet.trim()
                                .replace(/^["']+|["']+$/g, '')
                                .replace(/^,+|,+$/g, '')
                                .trim()
                              return (
                                <li key={index} className="flex items-start leading-relaxed">
                                  <span style={{ color: '#4A9D93' }} className="mr-2 mt-1 shrink-0">•</span>
                                  <span className="font-semibold">{cleanBullet}</span>
                                </li>
                              )
                            })
                          }
                        })()}
                      </ul>
                    )}
                  </div>
                ) : product.description || product.excerpt ? (
                  renderHTMLContent((product.description || product.excerpt) ?? null)
                ) : (
                  <p>No research summary available for this product.</p>
                )}
              </div>
            </section>

            {/* Detailed Notes */}
            <div className="space-y-8">
              {/* Repairability Notes */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Repairability Notes</h3>
                  <div
                    className={getScoreBadgeStyle(product.repairability_score || 0).className}
                    data-score={getScoreBadgeStyle(product.repairability_score || 0).dataScore}
                  >
                    <span className="text-sm font-bold">
                      {(product.repairability_score || 0).toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="space-y-3 text-brand-gray text-sm leading-relaxed">
                  {product.repairability_notes ? (
                    renderHTMLContent(product.repairability_notes)
                  ) : (
                    <p>No repairability information available.</p>
                  )}
                </div>
              </div>

              {/* Durability Notes */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Durability Notes</h3>
                  <div
                    className={getScoreBadgeStyle(product.durability_score || 0).className}
                    data-score={getScoreBadgeStyle(product.durability_score || 0).dataScore}
                  >
                    <span className="text-sm font-bold">
                      {(product.durability_score || 0).toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="space-y-3 text-brand-gray text-sm leading-relaxed">
                  {product.durability_notes ? (
                    renderHTMLContent(product.durability_notes)
                  ) : (
                    <p>No durability information available.</p>
                  )}
                </div>
              </div>

              {/* Warranty Notes */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Warranty Notes</h3>
                  <div
                    className={getScoreBadgeStyle(product.warranty_score || 0).className}
                    data-score={getScoreBadgeStyle(product.warranty_score || 0).dataScore}
                  >
                    <span className="text-sm font-bold">
                      {(product.warranty_score || 0).toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="space-y-3 text-brand-gray text-sm leading-relaxed">
                  {product.warranty_notes ? (
                    renderHTMLContent(product.warranty_notes)
                  ) : (
                    <p>This product comes with a {product.warranty_years || 'limited'} warranty.</p>
                  )}
                </div>
              </div>

              {/* Social Analysis */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Social Analysis</h3>
                  <div
                    className={getScoreBadgeStyle(product.social_score || 0).className}
                    data-score={getScoreBadgeStyle(product.social_score || 0).dataScore}
                  >
                    <span className="text-sm font-bold">
                      {(product.social_score || 0).toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="space-y-3 text-brand-gray text-sm leading-relaxed">
                  {product.social_notes ? (
                    renderHTMLContent(product.social_notes)
                  ) : (
                    <p>No social impact information available.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Product Sidebar - Right Column */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6 lg:space-y-8 lg:sticky lg:top-24">
            {/* BIFL Score Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-lg font-bold">BIFL Total Score:</span>
                <div
                  className={scoreBadge.className}
                  data-score={scoreBadge.dataScore}
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
              <div className="bg-white rounded-lg p-4 border border-gray-100">
                {product.featured_image_url ? (
                  <Image
                    src={product.featured_image_url}
                    alt={product.name || 'Product'}
                    width={400}
                    height={400}
                    className="w-full h-56 object-contain"
                  />
                ) : (
                  <div className="w-full h-56 bg-white rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">No image available</span>
                  </div>
                )}
              </div>

              {/* Badges */}
              <div className="mt-4 flex justify-center">
                <BadgeDisplay product={product} size="xs" overlay={false} className="!flex !flex-row !gap-2" />
              </div>

              <div className="mt-6 flex flex-col space-y-3">
                {product.affiliate_link && (
                  <a
                    href={product.affiliate_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackAffiliateClick(product.id, product.name, product.affiliate_link!)}
                    className="flex items-center justify-between w-full border border-gray-200 rounded-lg px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-orange-500 rounded mr-3 flex items-center justify-center text-white">
                        <SiAmazon className="w-5 h-5" />
                      </div>
                      <span>Amazon</span>
                    </div>
                    <span className="font-bold">${product.price || '—'}</span>
                  </a>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <FavoriteButtonWithText
                    productId={product.id}
                    className="justify-center py-1 px-2 text-xs"
                  />
                  <AddToCompareButton
                    product={{
                      id: product.id,
                      name: product.name,
                      price: parseFloat(product.price?.toString() || '0') || 0,
                      images: product.images || [],
                      average_score: product.bifl_total_score ?? undefined,
                      affiliate_link: product.affiliate_link ?? undefined
                    }}
                    size="sm"
                    variant="secondary"
                  />
                </div>
              </div>
            </div>

            {/* Product Scorecard */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold mb-6">Product Scorecard</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold">BIFL TOTAL SCORE</span>
                  <div
                    className={scoreBadge.className}
                    data-score={scoreBadge.dataScore}
                  >
                    <span className="text-sm font-bold">
                      {totalScore.toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold">Durability Score</span>
                  <div
                    className={getScoreBadgeStyle(product.durability_score || 0).className}
                    data-score={getScoreBadgeStyle(product.durability_score || 0).dataScore}
                  >
                    <span className="text-sm font-bold">
                      {(product.durability_score || 0).toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold">Repairability Score</span>
                  <div
                    className={getScoreBadgeStyle(product.repairability_score || 0).className}
                    data-score={getScoreBadgeStyle(product.repairability_score || 0).dataScore}
                  >
                    <span className="text-sm font-bold">
                      {(product.repairability_score || 0).toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold">Social Score</span>
                  <div
                    className={getScoreBadgeStyle(product.social_score || 0).className}
                    data-score={getScoreBadgeStyle(product.social_score || 0).dataScore}
                  >
                    <span className="text-sm font-bold">
                      {(product.social_score || 0).toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold">Warranty Score</span>
                  <div
                    className={getScoreBadgeStyle(product.warranty_score || 0).className}
                    data-score={getScoreBadgeStyle(product.warranty_score || 0).dataScore}
                  >
                    <span className="text-sm font-bold">
                      {(product.warranty_score || 0).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-6 border-t border-gray-200 pt-6">
                <p className="text-xs text-brand-gray text-center mb-4">
                  Based on <span className="font-bold text-brand-dark">199</span> reviews
                </p>
                <div className="flex justify-center items-center space-x-6 text-2xl text-brand-gray">
                  <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white">
                    <SiAmazon className="w-5 h-5" />
                  </div>
                  <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center text-white">
                    <SiReddit className="w-5 h-5" />
                  </div>
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                    <SiGoogle className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-xs text-brand-gray mt-6 leading-relaxed">
                  We rate products using a 10-point scoring system focused on what matters most: durability, reliability, and repairability. Our scores are built from a wide net of sources: Amazon reviews, Reddit threads, expert opinions, brand sites, Google reviews, and what people are actually saying online.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Expert Pros & Cons */}
        <ProductProsCons product={product} />

        {/* Image Gallery */}
        <section className="mt-16 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold mb-6 text-center">Image Gallery</h2>

          {galleryImages.length > 0 ? (
            <div className="space-y-6">
              {/* Main Image Display */}
              <div className="relative">
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={prevImage}
                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50"
                    disabled={galleryImages.length <= 1}
                  >
                    <ChevronLeft className="w-4 h-4 text-brand-gray" />
                  </button>

                  <div className="flex-1 max-w-2xl">
                    <div className="relative aspect-video bg-gray-50 rounded-lg overflow-hidden">
                      <Image
                        src={galleryImages[currentImageIndex].url}
                        alt={galleryImages[currentImageIndex].alt}
                        fill
                        className="object-contain"
                        priority
                      />
                    </div>
                    <p className="text-center text-sm text-brand-gray mt-2">
                      {galleryImages[currentImageIndex].caption}
                    </p>
                  </div>

                  <button
                    onClick={nextImage}
                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50"
                    disabled={galleryImages.length <= 1}
                  >
                    <ChevronRight className="w-4 h-4 text-brand-gray" />
                  </button>
                </div>
              </div>

              {/* Thumbnail Navigation */}
              {galleryImages.length > 1 && (
                <div className="flex flex-row justify-center items-center gap-3 flex-wrap">
                  {galleryImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => goToImage(index)}
                      className={`relative w-20 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                        index === currentImageIndex
                          ? 'border-brand-teal shadow-md'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Image
                        src={image.url}
                        alt={image.alt}
                        fill
                        className="object-cover"
                      />
                      {index === currentImageIndex && (
                        <div className="absolute inset-0 bg-brand-teal/20"></div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Image Counter */}
              <div className="text-center text-sm text-brand-gray">
                {currentImageIndex + 1} of {galleryImages.length}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                <span className="text-gray-500">No images available</span>
              </div>
              <p className="text-brand-gray text-sm">No product images to display</p>
            </div>
          )}
        </section>

        {/* FAQ Section */}
        <ProductFAQ productId={product.id} />

        {/* Care & Maintenance */}
        <ProductCareMaintenance careData={product.care_and_maintenance} />

        {/* Reviews Section */}
        <section className="mt-16 space-y-8">
          <ReviewForm
            productId={product.id}
            onReviewSubmitted={() => setReviewRefreshTrigger(prev => prev + 1)}
          />

          <ReviewsList
            productId={product.id}
            refreshTrigger={reviewRefreshTrigger}
          />
        </section>

        {/* Product Comparison Table */}
        <ProductComparisonTable
          currentProduct={{
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price?.toString() || '',
            featured_image_url: product.featured_image_url ?? undefined,
            bifl_total_score: product.bifl_total_score ?? undefined,
            durability_score: product.durability_score ?? undefined,
            repairability_score: product.repairability_score ?? undefined,
            warranty_score: product.warranty_score ?? undefined,
            sustainability_score: product.sustainability_score ?? undefined,
            social_score: product.social_score ?? undefined
          }}
        />

        {/* Similar Products Carousel */}
        <SimilarProductsCarousel
          currentProductId={product.id}
          categoryId={product.category_id ?? undefined}
        />

        {/* Newsletter Signup */}
        <section className="mt-16 border border-gray-200 rounded-2xl p-10 text-center">
          <h2 className="text-3xl font-bold mb-2">Grab our Buy-It-For-Life Newsletter</h2>
          <p className="text-brand-gray mb-6">Sign up for the BIFL Bi-Monthly</p>
          <div className="flex justify-center space-x-6 text-sm text-brand-gray mb-8">
            <div className="flex items-center">✓ New product picks</div>
            <div className="flex items-center">✓ Long-term gear reports</div>
            <div className="flex items-center">✓ Repair tips & sustainability news</div>
          </div>
          <form onSubmit={handleNewsletterSubmit} className="max-w-lg mx-auto">
            <div className="flex space-x-4 mb-4">
              <input
                type="email"
                placeholder="Enter your email address"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                disabled={newsletterStatus === 'loading' || newsletterStatus === 'success'}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                required
              />
            </div>
            {newsletterMessage && (
              <div className={`mb-4 p-3 rounded-lg ${
                newsletterStatus === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {newsletterMessage}
              </div>
            )}
            <button
              type="submit"
              disabled={newsletterStatus === 'loading' || newsletterStatus === 'success'}
              className="text-white font-bold py-3 px-8 rounded-lg hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#4A9D93' }}
            >
              {newsletterStatus === 'loading' ? 'Submitting...' : newsletterStatus === 'success' ? 'Subscribed!' : 'Submit'}
            </button>
          </form>
        </section>

        {/* Help Us Improve */}
        <section className="mt-8 border border-gray-200 rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-2">Help Us Improve</h2>
          <p className="text-brand-gray mb-6 max-w-xl mx-auto">This site is for you. Help us make it better. We're constantly refining the way we score and present BIFL products. If something's missing, broken, or off — we want to hear from you.</p>
          <button
            onClick={() => setIsFeedbackModalOpen(true)}
            className="bg-gray-700 text-white font-bold py-3 px-8 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Leave Us Feedback
          </button>
        </section>
      </main>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />
    </div>
  )
}