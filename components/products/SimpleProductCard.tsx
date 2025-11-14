'use client'

import Link from 'next/link'
import BadgeDisplay from '@/components/BadgeDisplay'
import { AddToCompareButton } from '@/components/compare/add-to-compare-button'

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

interface SimpleProductCardProps {
  product: any
}

export function SimpleProductCard({ product }: SimpleProductCardProps) {
  const totalScore = product.bifl_total_score || 0

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 text-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
      <Link href={`/products/${product.slug}`} className="relative mb-4 block group/image">
        <img
          className="w-full h-56 object-contain group-hover/image:scale-105 transition-transform duration-300"
          src={product.featured_image_url || '/placeholder-product.png'}
          alt={product.name || 'Product'}
        />
        <BadgeDisplay
          product={product}
          size="xs"
          overlay={true}
        />
      </Link>
      <h3 className="text-xl font-semibold">{product.name}</h3>
      <p className="text-brand-gray mb-4">{product.brand_name}</p>
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
          href={`/products/${product.slug}`}
          className="w-full text-white font-semibold py-2 px-6 rounded-lg hover:bg-opacity-90 transition-colors cursor-pointer text-center"
          style={{ backgroundColor: '#4A9D93' }}
        >
          View Product
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
  )
}