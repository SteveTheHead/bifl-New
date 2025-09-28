'use client'

import Link from 'next/link'

// Get gradient pill styling based on BIFL score
function getScoreBadgeStyle(score: number) {
  const scoreString = score.toString()
  return {
    className: "score-field px-2 py-1 rounded-full text-xs font-bold tracking-wide",
    dataScore: scoreString
  }
}

// Format relative time for "viewed at"
function formatViewedAt(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) return "now"
  if (diffInMinutes < 60) return `${diffInMinutes}m`

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h`

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

interface MiniRecentlyViewedCardProps {
  product: any
}

export function MiniRecentlyViewedCard({ product }: MiniRecentlyViewedCardProps) {
  const totalScore = product.bifl_total_score || 0

  return (
    <Link href={`/products/${product.id}`} className="group">
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-3 border border-gray-100 hover:border-brand-teal/30">
        <div className="flex items-center space-x-3">
          {/* Mini Image */}
          <div className="flex-shrink-0 relative">
            <img
              className="w-12 h-12 object-cover rounded-md"
              src={product.featured_image_url || '/placeholder-product.png'}
              alt={product.name || 'Product'}
            />
            {/* Tiny timestamp badge */}
            {product.viewed_at && (
              <div className="absolute -top-1 -right-1 bg-brand-teal text-white text-xs px-1 py-0.5 rounded text-[10px] leading-none">
                {formatViewedAt(product.viewed_at)}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-brand-dark truncate group-hover:text-brand-teal transition-colors">
                  {product.name}
                </h3>
                <p className="text-xs text-brand-gray truncate">{product.brand_name}</p>
              </div>

              {/* Buy Now Button - Top Right */}
              {product.affiliate_link && (
                <button
                  className="text-white px-2 py-1 rounded text-xs font-medium hover:opacity-90 transition-opacity ml-2"
                  style={{ backgroundColor: '#4A9D93' }}
                  onClick={(e) => {
                    e.stopPropagation()
                    window.open(product.affiliate_link, '_blank', 'noopener,noreferrer')
                  }}
                >
                  Buy Now
                </button>
              )}
            </div>

            {/* Price and Score */}
            <div className="flex items-center justify-between mt-1">
              {product.price && (
                <span className="text-sm font-semibold text-brand-teal">${product.price}</span>
              )}
              <div
                className={`${getScoreBadgeStyle(totalScore).className}`}
                data-score={getScoreBadgeStyle(totalScore).dataScore}
              >
                {totalScore.toFixed(1)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}