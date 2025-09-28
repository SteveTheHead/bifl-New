'use client'

import Link from 'next/link'
import BadgeDisplay from '@/components/BadgeDisplay'
import { AddToCompareButton } from '@/components/compare/add-to-compare-button'
import { Clock } from 'lucide-react'

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

// Format relative time for "viewed at"
function formatViewedAt(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) return "Just now"
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

interface RecentlyViewedCardProps {
  product: any
}

export function RecentlyViewedCard({ product }: RecentlyViewedCardProps) {
  const totalScore = product.bifl_total_score || 0

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 text-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
      <div className="relative mb-4">
        <img
          className="w-full h-56 object-contain"
          src={product.featured_image_url || '/placeholder-product.png'}
          alt={product.name || 'Product'}
        />
        <BadgeDisplay
          product={product}
          size="xs"
          overlay={true}
        />
        {/* Viewed timestamp overlay */}
        {product.viewed_at && (
          <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatViewedAt(product.viewed_at)}
          </div>
        )}
      </div>
      <h3 className="text-xl font-semibold">{product.name}</h3>
      <p className="text-brand-gray mb-2">{product.brand_name}</p>

      {/* Price if available */}
      {product.price && (
        <p className="text-brand-teal font-semibold mb-4">${product.price}</p>
      )}

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

      <div className="flex flex-col gap-2">
        <Link
          href={`/products/${product.id}`}
          className="w-full text-white font-semibold py-2 px-6 rounded-lg hover:bg-opacity-90 transition-colors cursor-pointer text-center"
          style={{ backgroundColor: '#4A9D93' }}
        >
          View Again
        </Link>
        <div className="flex justify-center">
          <AddToCompareButton
            product={{
              id: product.id,
              name: product.name,
              price: parseFloat(product.price) || 0,
              images: product.featured_image_url ? [product.featured_image_url] : [],
              average_score: product.bifl_total_score,
              purchase_url: product.purchase_url
            }}
            size="sm"
            variant="secondary"
          />
        </div>
      </div>
    </div>
  )
}