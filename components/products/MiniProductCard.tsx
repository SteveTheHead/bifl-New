'use client'

import Link from 'next/link'
import Image from 'next/image'

// Get gradient pill styling based on BIFL score
function getScoreBadgeStyle(score: number) {
  const scoreString = score.toString()
  return {
    className: "score-field px-2 py-1 rounded-full text-xs font-bold tracking-wide",
    dataScore: scoreString
  }
}


interface MiniProduct {
  id: string
  name: string
  brand_name?: string
  featured_image_url?: string | null
  price?: number | string | null
  bifl_total_score?: number | null
  affiliate_link?: string | null
}

interface MiniProductCardProps {
  product: MiniProduct
}

export function MiniProductCard({ product }: MiniProductCardProps) {
  const totalScore = product.bifl_total_score || 0

  return (
    <Link href={`/products/${product.id}`} className="group">
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-3 border border-gray-100 hover:border-brand-teal/30">
        <div className="flex items-center space-x-3">
          {/* Mini Image */}
          <div className="flex-shrink-0">
            <Image
              className="w-12 h-12 object-cover rounded-md"
              src={product.featured_image_url || '/placeholder-product.png'}
              alt={product.name || 'Product'}
              width={48}
              height={48}
            />
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
                    if (product.affiliate_link) window.open(product.affiliate_link, '_blank', 'noopener,noreferrer')
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