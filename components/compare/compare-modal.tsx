'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { X, Plus, ExternalLink } from 'lucide-react'
import { useCompare } from '@/contexts/compare-context'

interface CompareProduct {
  id: string
  name: string
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

// Badge calculation function (matching product-grid logic)
function calculateBadges(product: CompareProduct): string[] {
  if (!product) return []

  const badges: string[] = []
  const totalScore = product.average_score || 0
  const warrantyScore = product.warranty_score || 0
  const socialScore = product.social_score || 0
  const repairabilityScore = product.repairability_score || 0
  const sustainabilityScore = product.sustainability_score || 0
  const durabilityScore = product.durability_score || 0

  // Gold Standard: 9.0+ average across all scores with high individual scores
  if (totalScore >= 9.0 &&
      durabilityScore >= 8.5 &&
      warrantyScore >= 8.0) {
    badges.push('Gold Standard')
  }

  // Lifetime Warranty: Warranty score = 10
  if (warrantyScore >= 10.0) {
    badges.push('Lifetime Warranty')
  }

  // Crowd Favorite: Social score ≥ 8.5
  if (socialScore >= 8.5) {
    badges.push('Crowd Favorite')
  }

  // Repair Friendly: Repairability score ≥ 8.5
  if (repairabilityScore >= 8.5) {
    badges.push('Repair Friendly')
  }

  // Eco Hero: Sustainability score ≥ 8.0
  if (sustainabilityScore >= 8.0) {
    badges.push('Eco Hero')
  }

  // BIFL Approved: 7.5+ across all categories (only if no other badges)
  if (badges.length === 0 &&
      totalScore >= 7.5 &&
      durabilityScore >= 7.0 &&
      warrantyScore >= 6.0) {
    badges.push('BIFL Approved')
  }

  return badges
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

  useEffect(() => {
    if (showCompareModal && compareProducts.length > 0) {
      fetchDetailedProducts()
    }
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
      return () => document.removeEventListener('keydown', handleEscape)
    }
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

  const getScoreBadge = (score?: number) => {
    if (!score) return null

    const getScoreColor = (score: number) => {
      if (score >= 8.5) return 'bg-green-500'
      if (score >= 7.5) return 'bg-blue-500'
      if (score >= 6.5) return 'bg-yellow-500'
      return 'bg-red-500'
    }

    return (
      <div className={`inline-flex items-center px-2 py-1 rounded-full text-black text-sm font-medium ${getScoreColor(score)}`}>
        {score}/10
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-dark to-brand-darker text-white p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-black">Compare Products</h2>
          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white transition-colors p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-brand-dark border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading comparison...</p>
            </div>
          ) : (
            <div className="p-6">
              {/* Comparison Grid */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {/* Render up to 3 slots */}
                {Array.from({ length: 3 }, (_, index) => {
                  const product = detailedProducts[index]

                  if (product) {
                    return (
                      <div key={product.id} className="relative">
                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromCompare(product.id)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors z-10"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        {/* Product Card */}
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          {/* Image */}
                          <div className="relative mb-2">
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-28 object-contain"
                              />
                            ) : (
                              <div className="w-full h-28 flex items-center justify-center text-gray-400 text-xs bg-gray-100">
                                No Image
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="p-2 space-y-1">
                            {/* Name */}
                            <h3 className="font-semibold text-xs text-gray-900 line-clamp-2 leading-tight">
                              {product.name}
                            </h3>

                            {/* Price */}
                            <div className="text-sm font-bold text-brand-dark">
                              ${product.price}
                            </div>

                            {/* BIFL Total Score */}
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-600">BIFL Total Score:</span>
                              {product.average_score ? (
                                <div
                                  className={`${getScoreBadgeStyle(product.average_score).className} inline-flex items-center gap-1`}
                                  data-score={getScoreBadgeStyle(product.average_score).dataScore}
                                >
                                  <span className="text-xs font-bold tracking-wide">
                                    {product.average_score.toFixed(1)}
                                  </span>
                                  <span className="text-xs font-medium opacity-90">
                                    {getScoreLabel(product.average_score)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-400 text-xs">No score</span>
                              )}
                            </div>

                            {/* Review Count */}
                            {product.review_count !== undefined && (
                              <div className="text-xs text-gray-600">
                                {product.review_count} {product.review_count === 1 ? 'review' : 'reviews'}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  } else if (canAddMore) {
                    // Empty slot with plus icon
                    return (
                      <button
                        key={`empty-${index}`}
                        onClick={handleClose}
                        className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center aspect-square hover:border-brand-teal hover:bg-brand-teal/5 transition-colors cursor-pointer"
                      >
                        <div className="text-center text-gray-500 hover:text-brand-teal transition-colors">
                          <Plus className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-xs">Add product</p>
                          <p className="text-xs text-gray-400">Click to browse</p>
                        </div>
                      </button>
                    )
                  } else {
                    // Empty placeholder (no plus if can't add more)
                    return (
                      <div key={`placeholder-${index}`} className="border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center aspect-square opacity-50">
                        <div className="text-center text-gray-300">
                          <div className="w-8 h-8 mx-auto mb-2 bg-gray-200 rounded-full"></div>
                          <p className="text-xs">Empty</p>
                        </div>
                      </div>
                    )
                  }
                })}
              </div>

              {/* Detailed Comparison Table */}
              {detailedProducts.length >= 2 && (
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold mb-6">Detailed Comparison</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-200">
                          <th className="text-left py-4 text-sm font-medium text-gray-600 w-40">Feature</th>
                          {detailedProducts.map(product => (
                            <th key={product.id} className="text-center py-4 text-sm font-medium text-gray-900 min-w-[180px]">
                              <div className="flex flex-col items-center gap-2">
                                <img
                                  src={product.images?.[0] || '/placeholder-product.png'}
                                  alt={product.name}
                                  className="w-16 h-16 object-contain rounded-lg"
                                />
                                <span className="text-xs leading-tight">
                                  {product.name.length > 25 ? `${product.name.substring(0, 25)}...` : product.name}
                                </span>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-100">
                          <td className="py-4 text-sm font-medium text-gray-700">Price</td>
                          {detailedProducts.map(product => (
                            <td key={product.id} className="py-4 text-center text-lg font-bold text-brand-dark">
                              ${product.price}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-4 text-sm font-medium text-gray-700">BIFL Total Score</td>
                          {detailedProducts.map(product => (
                            <td key={product.id} className="py-4 text-center">
                              {product.average_score ? (
                                <div
                                  className={`${getScoreBadgeStyle(product.average_score).className} inline-flex items-center gap-2`}
                                  data-score={getScoreBadgeStyle(product.average_score).dataScore}
                                >
                                  <span className="text-sm font-bold tracking-wide">
                                    {product.average_score.toFixed(1)}
                                  </span>
                                  <span className="text-xs font-medium opacity-90">
                                    {getScoreLabel(product.average_score)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm">No score</span>
                              )}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-4 text-sm font-medium text-gray-700">Durability</td>
                          {detailedProducts.map(product => (
                            <td key={product.id} className="py-4 text-center">
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
                          <td className="py-4 text-sm font-medium text-gray-700">Repairability</td>
                          {detailedProducts.map(product => (
                            <td key={product.id} className="py-4 text-center">
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
                          <td className="py-4 text-sm font-medium text-gray-700">Warranty</td>
                          {detailedProducts.map(product => (
                            <td key={product.id} className="py-4 text-center">
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
                          <td className="py-4 text-sm font-medium text-gray-700">Sustainability</td>
                          {detailedProducts.map(product => (
                            <td key={product.id} className="py-4 text-center">
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
                          <td className="py-4 text-sm font-medium text-gray-700">Social Consensus</td>
                          {detailedProducts.map(product => (
                            <td key={product.id} className="py-4 text-center">
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
                          <td className="py-4 text-sm font-medium text-gray-700">Badges</td>
                          {detailedProducts.map(product => (
                            <td key={product.id} className="py-2 text-center">
                              <div className="flex flex-wrap gap-1 justify-center items-center">
                                {calculateBadges(product).length > 0 ? (
                                  calculateBadges(product).map((badge, index) => {
                                    const svgPath = getBadgeSvgPath(badge)
                                    return svgPath ? (
                                      <Image
                                        key={index}
                                        src={svgPath}
                                        alt={badge}
                                        width={64}
                                        height={64}
                                        className="w-16 h-16"
                                        title={badge}
                                      />
                                    ) : null
                                  })
                                ) : (
                                  <div className="w-16 h-16 flex items-center justify-center">
                                    <X className="w-8 h-8 text-gray-400" />
                                  </div>
                                )}
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="py-4 text-sm font-medium text-gray-700">Reviews</td>
                          {detailedProducts.map(product => (
                            <td key={product.id} className="py-4 text-center text-sm text-gray-600">
                              {product.review_count || 0} reviews
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="py-6 text-sm font-medium text-gray-700">Purchase</td>
                          {detailedProducts.map(product => (
                            <td key={product.id} className="py-6 text-center">
                              <div className="flex flex-col gap-2 items-center">
                                <Link
                                  href={`/products/${product.id}`}
                                  onClick={() => setShowCompareModal(false)}
                                  className="bg-teal-600 text-white text-xs font-medium py-2 px-2 rounded-lg hover:bg-teal-700 transition-colors w-1/2"
                                >
                                  View Details
                                </Link>
                                {product.affiliate_link && (
                                  <a
                                    href={product.affiliate_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-green-600 text-black text-xs font-medium py-2 px-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-1 w-1/2"
                                  >
                                    Buy Now
                                    <ExternalLink className="w-3 h-3" />
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