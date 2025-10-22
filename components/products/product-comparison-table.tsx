'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, X } from 'lucide-react'

interface ComparisonProduct {
  id: string
  name: string
  price: string
  featured_image_url?: string
  bifl_total_score?: number
  durability_score?: number
  repairability_score?: number
  warranty_score?: number
  sustainability_score?: number
  social_score?: number
  category_id?: string
}

interface ProductComparisonTableProps {
  currentProduct: ComparisonProduct
}

// Badge calculation function (matching compare modal logic)
function calculateBadges(product: ComparisonProduct): string[] {
  if (!product) return []

  const badges: string[] = []
  const totalScore = product.bifl_total_score || 0
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

// Get gradient pill styling based on BIFL score (matching compare modal)
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

export function ProductComparisonTable({ currentProduct }: ProductComparisonTableProps) {
  const [relatedProducts, setRelatedProducts] = useState<ComparisonProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        const response = await fetch(`/api/products/${currentProduct.id}/related`)
        if (response.ok) {
          const data = await response.json()
          setRelatedProducts(data.products || [])
        }
      } catch (error) {
        console.error('Failed to fetch related products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRelatedProducts()
  }, [currentProduct.id])

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-bold mb-4">Compare with Similar Products</h3>
        <div className="text-center py-8 text-gray-500">Loading comparison...</div>
      </div>
    )
  }

  if (relatedProducts.length === 0) {
    return null // Only show comparison table if we have at least 1 similar product
  }

  const allProducts = [currentProduct, ...relatedProducts]

  return (
    <div className="bg-gray-50 rounded-xl p-6 mt-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold">Detailed Comparison</h3>
        <Link
          href="/products"
          className="text-teal-600 hover:text-teal-700 font-medium text-sm flex items-center gap-1"
        >
          View all products
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-4 text-sm font-medium text-gray-600 w-40">Feature</th>
              {allProducts.map((product, _index) => (
                <th key={product.id} className="text-center py-4 text-sm font-medium text-gray-900 min-w-[180px]">
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative">
                      <img
                        src={product.featured_image_url || '/placeholder-product.png'}
                        alt={product.name}
                        className="w-16 h-16 object-contain rounded-lg"
                      />
                    </div>
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
              {allProducts.map(product => (
                <td key={product.id} className="py-4 text-center text-lg font-bold text-brand-dark">
                  ${product.price}
                </td>
              ))}
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-4 text-sm font-medium text-gray-700">BIFL Total Score</td>
              {allProducts.map(product => (
                <td key={product.id} className="py-4 text-center">
                  {product.bifl_total_score ? (
                    <div
                      className={`${getScoreBadgeStyle(product.bifl_total_score).className} inline-flex items-center gap-2`}
                      data-score={getScoreBadgeStyle(product.bifl_total_score).dataScore}
                    >
                      <span className="text-sm font-bold tracking-wide">
                        {product.bifl_total_score.toFixed(1)}
                      </span>
                      <span className="text-xs font-medium opacity-90">
                        {getScoreLabel(product.bifl_total_score)}
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
              {allProducts.map(product => (
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
              {allProducts.map(product => (
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
              {allProducts.map(product => (
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
              {allProducts.map(product => (
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
              {allProducts.map(product => (
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
              {allProducts.map(product => (
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
              <td className="py-6 text-sm font-medium text-gray-700">Purchase</td>
              {allProducts.map((product, index) => (
                <td key={product.id} className="py-6 text-center">
                  <div className="flex flex-col gap-2 items-center">
                    {index === 0 ? (
                      <span className="text-xs text-gray-500 font-medium">Current Product</span>
                    ) : (
                      <Link
                        href={`/products/${product.id}`}
                        className="bg-teal-600 text-white text-xs font-medium py-2 px-2 rounded-lg hover:bg-teal-700 transition-colors w-1/2"
                      >
                        View Details
                      </Link>
                    )}
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}