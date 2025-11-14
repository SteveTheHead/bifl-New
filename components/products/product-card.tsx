'use client'

import Link from 'next/link'
import BadgeDisplay from '@/components/BadgeDisplay'
import { AddToCompareButton } from '@/components/compare/add-to-compare-button'
import { Star, Wrench, Shield, DollarSign } from 'lucide-react'

interface ProductCardProps {
  product: any
  variant?: 'vertical' | 'horizontal'
}

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

export function ProductCard({ product, variant = 'vertical' }: ProductCardProps) {
  const totalScore = product.bifl_total_score || 0

  if (variant === 'horizontal') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 transition-all duration-300 hover:shadow-md hover:border-brand-teal/30">
        <div className="flex gap-4">
          {/* Image */}
          <Link href={`/products/${product.slug || product.id}`} className="relative w-32 h-32 flex-shrink-0 group/image">
            <img
              className="w-full h-full object-contain rounded-lg group-hover/image:scale-105 transition-transform duration-300"
              src={product.featured_image_url || '/placeholder-product.png'}
              alt={product.name || 'Product'}
            />
            <BadgeDisplay
              product={product}
              size="xs"
              overlay={true}
            />
          </Link>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-2">
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold text-brand-dark truncate">
                  {product.name}
                </h3>
                <p className="text-brand-gray text-sm">{product.brand_name}</p>
              </div>
              {product.price && (
                <div className="text-right ml-4">
                  <span className="text-xl font-bold text-brand-dark">
                    ${product.price}
                  </span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 mb-3 text-xs">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-500" />
                <span className="font-medium">
                  {totalScore.toFixed(1)}
                </span>
              </div>
              {product.durability_score && (
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-blue-500" />
                  <span>{product.durability_score}/10</span>
                </div>
              )}
              {product.repairability_score && (
                <div className="flex items-center gap-1">
                  <Wrench className="w-3 h-3 text-green-500" />
                  <span>{product.repairability_score}/10</span>
                </div>
              )}
              {product.warranty_score && (
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-purple-500" />
                  <span>Warranty: {product.warranty_score}/10</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Link
                href={`/products/${product.slug || product.id}`}
                className="flex-1 text-white text-sm font-medium py-2 px-4 rounded-lg hover:opacity-90 transition-colors text-center"
                style={{ backgroundColor: '#4A9D93' }}
              >
                View Details
              </Link>
              <AddToCompareButton
                product={{
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  price: parseFloat(product.price) || 0,
                  images: product.featured_image_url ? [product.featured_image_url] : [],
                  average_score: product.bifl_total_score,
                  affiliate_link: product.affiliate_link
                }}
                size="sm"
                variant="secondary"
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Vertical variant (default)
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-brand-teal/30 hover:-translate-y-1">
      {/* Image */}
      <Link href={`/products/${product.slug || product.id}`} className="relative aspect-square p-4 block group/image">
        <img
          className="w-full h-full object-contain group-hover/image:scale-105 transition-transform duration-300"
          src={product.featured_image_url || '/placeholder-product.png'}
          alt={product.name || 'Product'}
        />
        <BadgeDisplay
          product={product}
          size="xs"
          overlay={true}
        />
        {product.price && (
          <div className="absolute top-2 left-2 bg-white rounded-lg px-3 py-1.5 shadow-md border border-gray-200">
            <span className="text-base font-bold text-brand-dark">
              ${product.price}
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-brand-dark mb-1 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-brand-gray text-sm">{product.brand_name}</p>
        </div>

        {/* BIFL Score */}
        <div className="flex justify-center mb-4">
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

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Shield className="w-3 h-3 text-blue-500" />
            </div>
            <span className="font-medium">
              {product.durability_score ? `${product.durability_score}/10` : 'N/A'}
            </span>
            <div className="text-gray-500 text-[10px]">Durability</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Wrench className="w-3 h-3 text-green-500" />
            </div>
            <span className="font-medium">
              {product.repairability_score ? `${product.repairability_score}/10` : 'N/A'}
            </span>
            <div className="text-gray-500 text-[10px]">Repair</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Shield className="w-3 h-3 text-purple-500" />
            </div>
            <span className="font-medium">
              {product.warranty_score ? `${product.warranty_score}/10` : 'N/A'}
            </span>
            <div className="text-gray-500 text-[10px]">Warranty</div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Link
            href={`/products/${product.slug || product.id}`}
            className="w-full text-white font-medium py-2.5 px-4 rounded-lg hover:opacity-90 transition-colors text-center block"
            style={{ backgroundColor: '#4A9D93' }}
          >
            View Details
          </Link>
          <div className="flex justify-center">
            <AddToCompareButton
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                price: parseFloat(product.price) || 0,
                images: product.featured_image_url ? [product.featured_image_url] : [],
                average_score: product.bifl_total_score,
                affiliate_link: product.affiliate_link
              }}
              size="sm"
              variant="secondary"
            />
          </div>
        </div>
      </div>
    </div>
  )
}