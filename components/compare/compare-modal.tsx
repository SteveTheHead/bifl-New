'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { X, Plus, ExternalLink } from 'lucide-react'
import { useCompare } from '@/contexts/compare-context'
import { calculateBadges } from '@/lib/scoring'

interface CompareProduct {
  id: string
  name: string
  slug: string
  price: number
  images: string[]
  affiliate_link?: string
  average_score?: number
  review_count?: number
  durability_score?: number
  repairability_score?: number
  warranty_score?: number
  sustainability_score?: number
  social_score?: number
  description?: string
}

// Map badge names to SVG file paths
function getBadgeSvgPath(badgeName: string): string | null {
  const badgeMap: { [key: string]: string } = {
    'Gold Standard': '/badges/gold-standard.svg',
    'Lifetime Warranty': '/badges/lifetime-warranty.svg',
    'Crowd Favorite': '/badges/crowd-favorite.svg',
    'Repair Friendly': '/badges/repair-friendly.svg',
    'Eco Hero': '/badges/eco-hero.svg',
    'BIFL Approved': '/badges/bifl-approved.svg',
    'Legacy Product': '/badges/Legacy Product.svg'
  }

  return badgeMap[badgeName] || null
}

// Get gradient pill styling based on BIFL score (matching product detail page)
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

export function CompareModal() {
  const { compareProducts, showCompareModal, setShowCompareModal, removeFromCompare, canAddMore } = useCompare()
  const [detailedProducts, setDetailedProducts] = useState<CompareProduct[]>([])
  const [loading, setLoading] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (showCompareModal && compareProducts.length > 0) {
      fetchDetailedProducts()
    }
    // fetchDetailedProducts is defined inline and only reads compareProducts/showCompareModal, already in deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCompareModal, compareProducts])

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showCompareModal) {
        handleClose()
      }
    }

    if (showCompareModal) {
      document.addEventListener('keydown', handleEscape)
      // Move focus into the dialog on open (a11y — audit M10)
      closeButtonRef.current?.focus()
      // Lock background scroll while the modal is open
      const prevOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.removeEventListener('keydown', handleEscape)
        document.body.style.overflow = prevOverflow
      }
    }
    // handleClose only calls the stable setShowCompareModal setter; re-subscribing each render is unnecessary
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCompareModal])

  const fetchDetailedProducts = async () => {
    setLoading(true)
    try {
      const ids = compareProducts.map(p => p.id).join(',')
      const response = await fetch(`/api/products/compare?ids=${ids}`)
      if (response.ok) {
        const data = await response.json()
        setDetailedProducts(data.products)
      }
    } catch (error) {
      console.error('Failed to fetch detailed products:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!showCompareModal) {
    return null
  }

  const handleClose = () => {
    setShowCompareModal(false)
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="compare-modal-title"
        className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (dark gradient — title must be light) */}
        <div className="bg-gradient-to-r from-brand-dark to-brand-darker text-white p-4 flex items-center justify-between">
          <h2 id="compare-modal-title" className="text-xl font-bold text-white">Compare Products</h2>
          <button
            ref={closeButtonRef}
            onClick={handleClose}
            className="text-white/80 hover:text-white transition-colors p-2"
            aria-label="Close comparison"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-brand-dark border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading comparison...</p>
            </div>
          ) : (
            <div className="p-4">
              {/* Comparison Table */}
              {detailedProducts.length >= 1 && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-300">
                          <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 w-32 bg-white sticky left-0">Feature</th>
                          {detailedProducts.map(product => (
                            <th key={product.id} className="text-center py-2 px-2 text-sm font-medium text-gray-900 min-w-[160px] relative">
                              {/* Remove Button */}
                              <button
                                onClick={() => removeFromCompare(product.id)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors z-10"
                              >
                                <X className="w-3 h-3" />
                              </button>
                              <div className="flex flex-col items-center gap-1">
                                <Image
                                  src={product.images?.[0] || '/placeholder-product.png'}
                                  alt={product.name}
                                  width={56}
                                  height={56}
                                  sizes="56px"
                                  className="w-14 h-14 object-contain rounded-lg"
                                />
                                <span className="text-xs font-semibold leading-tight px-1 line-clamp-2">
                                  {product.name}
                                </span>
                                <div className="text-sm font-bold text-brand-dark">
                                  ${product.price}
                                </div>
                                {product.average_score && (
                                  <div
                                    className={`${getScoreBadgeStyle(product.average_score).className} inline-flex items-center gap-1`}
                                    data-score={getScoreBadgeStyle(product.average_score).dataScore}
                                  >
                                    <span className="text-xs font-bold">
                                      {product.average_score.toFixed(1)}
                                    </span>
                                    <span className="text-[10px] font-medium opacity-90">
                                      {getScoreLabel(product.average_score)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </th>
                          ))}
                          {/* Add empty slots for remaining products */}
                          {Array.from({ length: Math.max(0, 3 - detailedProducts.length) }, (_, index) => (
                            canAddMore ? (
                              <th key={`empty-${index}`} className="text-center py-2 min-w-[160px]">
                                <button
                                  onClick={handleClose}
                                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center hover:border-brand-teal hover:bg-brand-teal/5 transition-colors cursor-pointer w-full"
                                >
                                  <Plus className="w-6 h-6 mx-auto mb-1 text-gray-400" />
                                  <p className="text-[10px] text-gray-500">Add product</p>
                                </button>
                              </th>
                            ) : (
                              <th key={`empty-${index}`} className="text-center py-2 min-w-[160px]">
                                <div className="text-gray-300 text-xs">Empty</div>
                              </th>
                            )
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 px-3 text-xs font-medium text-gray-700 bg-white sticky left-0">Durability</td>
                          {detailedProducts.map(product => (
                            <td key={product.id} className="py-2 text-center">
                              {product.durability_score ? (
                                <div
                                  className={`${getScoreBadgeStyle(product.durability_score).className} inline-flex items-center gap-1`}
                                  data-score={getScoreBadgeStyle(product.durability_score).dataScore}
                                >
                                  <span className="text-xs font-bold">
                                    {product.durability_score.toFixed(1)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-400 text-xs">N/A</span>
                              )}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 px-3 text-xs font-medium text-gray-700 bg-white sticky left-0">Repairability</td>
                          {detailedProducts.map(product => (
                            <td key={product.id} className="py-2 text-center">
                              {product.repairability_score ? (
                                <div
                                  className={`${getScoreBadgeStyle(product.repairability_score).className} inline-flex items-center gap-1`}
                                  data-score={getScoreBadgeStyle(product.repairability_score).dataScore}
                                >
                                  <span className="text-xs font-bold">
                                    {product.repairability_score.toFixed(1)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-400 text-xs">N/A</span>
                              )}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 px-3 text-xs font-medium text-gray-700 bg-white sticky left-0">Warranty</td>
                          {detailedProducts.map(product => (
                            <td key={product.id} className="py-2 text-center">
                              {product.warranty_score ? (
                                <div
                                  className={`${getScoreBadgeStyle(product.warranty_score).className} inline-flex items-center gap-1`}
                                  data-score={getScoreBadgeStyle(product.warranty_score).dataScore}
                                >
                                  <span className="text-xs font-bold">
                                    {product.warranty_score.toFixed(1)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-400 text-xs">N/A</span>
                              )}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 px-3 text-xs font-medium text-gray-700 bg-white sticky left-0">Sustainability</td>
                          {detailedProducts.map(product => (
                            <td key={product.id} className="py-2 text-center">
                              {product.sustainability_score ? (
                                <div
                                  className={`${getScoreBadgeStyle(product.sustainability_score).className} inline-flex items-center gap-1`}
                                  data-score={getScoreBadgeStyle(product.sustainability_score).dataScore}
                                >
                                  <span className="text-xs font-bold">
                                    {product.sustainability_score.toFixed(1)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-400 text-xs">N/A</span>
                              )}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 px-3 text-xs font-medium text-gray-700 bg-white sticky left-0">Social Consensus</td>
                          {detailedProducts.map(product => (
                            <td key={product.id} className="py-2 text-center">
                              {product.social_score ? (
                                <div
                                  className={`${getScoreBadgeStyle(product.social_score).className} inline-flex items-center gap-1`}
                                  data-score={getScoreBadgeStyle(product.social_score).dataScore}
                                >
                                  <span className="text-xs font-bold">
                                    {product.social_score.toFixed(1)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-400 text-xs">N/A</span>
                              )}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 px-3 text-xs font-medium text-gray-700 bg-white sticky left-0">Badges</td>
                          {detailedProducts.map(product => (
                            <td key={product.id} className="py-2 text-center">
                              <div className="flex flex-wrap gap-0.5 justify-center items-center">
                                {calculateBadges(product).length > 0 ? (
                                  calculateBadges(product).map((badge, index) => {
                                    const svgPath = getBadgeSvgPath(badge)
                                    return svgPath ? (
                                      <Image
                                        key={index}
                                        src={svgPath}
                                        alt={badge}
                                        width={48}
                                        height={48}
                                        className="w-10 h-10"
                                        title={badge}
                                      />
                                    ) : null
                                  })
                                ) : (
                                  <div className="w-10 h-10 flex items-center justify-center">
                                    <X className="w-4 h-4 text-gray-400" />
                                  </div>
                                )}
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="py-2 px-3 text-xs font-medium text-gray-700 bg-white sticky left-0">Reviews</td>
                          {detailedProducts.map(product => (
                            <td key={product.id} className="py-2 text-center text-xs text-gray-600">
                              {product.review_count || 0} reviews
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="py-3 px-3 text-xs font-medium text-gray-700 bg-white sticky left-0">Actions</td>
                          {detailedProducts.map(product => (
                            <td key={product.id} className="py-3 text-center">
                              <div className="flex flex-col gap-1 items-center">
                                <Link
                                  href={`/products/${product.slug}`}
                                  onClick={() => setShowCompareModal(false)}
                                  className="bg-teal-600 text-white text-[10px] font-medium py-1.5 px-3 rounded hover:bg-teal-700 transition-colors"
                                >
                                  View Details
                                </Link>
                                {product.affiliate_link && (
                                  <a
                                    href={product.affiliate_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-green-600 text-white text-[10px] font-medium py-1.5 px-3 rounded hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                                  >
                                    Buy Now
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                )}
                              </div>
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}