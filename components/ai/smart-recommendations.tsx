'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Brain, Star, TrendingUp, User, RefreshCw } from 'lucide-react'
import { usePersonalizedRecommendations } from '@/hooks/use-behavior-tracking'
import BadgeDisplay from '@/components/BadgeDisplay'

interface SmartRecommendationsProps {
  productId?: string
  title?: string
  maxItems?: number
  showReasoning?: boolean
  className?: string
}

interface Recommendation {
  id: string
  name: string
  brand_name: string
  category_name: string
  bifl_total_score: number
  featured_image_url?: string
  price?: string
  affiliate_link?: string
}

interface RecommendationResponse {
  recommendations: Recommendation[]
  type: 'product-based' | 'preference-based' | 'trending'
  reasoning?: string
  behaviorScore?: number
}

export function SmartRecommendations({
  productId,
  title,
  maxItems = 6,
  showReasoning = false,
  className = ''
}: SmartRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recommendationType, setRecommendationType] = useState<string>('')
  const [reasoning, setReasoning] = useState<string>('')

  const { getRecommendations, behaviorData } = usePersonalizedRecommendations(productId)

  useEffect(() => {
    loadRecommendations()
  }, [productId])

  const loadRecommendations = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await getRecommendations()

      if (!response) {
        throw new Error('Failed to load recommendations')
      }

      setRecommendations(response.recommendations.slice(0, maxItems))
      setRecommendationType(response.type)
      setReasoning(response.reasoning || '')
    } catch (error) {
      console.error('Recommendations error:', error)
      setError('Unable to load recommendations')
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'product-based':
        return <Star className="w-4 h-4" />
      case 'preference-based':
        return <User className="w-4 h-4" />
      case 'trending':
        return <TrendingUp className="w-4 h-4" />
      default:
        return <Brain className="w-4 h-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'product-based':
        return 'Similar Products'
      case 'preference-based':
        return 'Personalized for You'
      case 'trending':
        return 'Trending Now'
      default:
        return 'AI Recommendations'
    }
  }

  const getTypeDescription = (type: string) => {
    switch (type) {
      case 'product-based':
        return 'Based on products similar to this one'
      case 'preference-based':
        return 'Tailored to your browsing history and preferences'
      case 'trending':
        return 'Popular products with high BIFL scores'
      default:
        return 'AI-powered product recommendations'
    }
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-brand-teal mr-2" />
          <span className="text-brand-gray">Loading recommendations...</span>
        </div>
      </div>
    )
  }

  if (error || recommendations.length === 0) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
        <div className="text-center py-8">
          <Brain className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-brand-gray">
            {error || 'No recommendations available at this time'}
          </p>
          <button
            onClick={loadRecommendations}
            className="mt-3 text-sm text-brand-teal hover:text-brand-teal/80"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-brand-dark flex items-center">
            <Brain className="w-5 h-5 mr-2 text-brand-teal" />
            {title || getTypeLabel(recommendationType)}
          </h3>
          <p className="text-sm text-brand-gray mt-1">
            {getTypeDescription(recommendationType)}
          </p>
        </div>

        <div className="flex items-center text-sm text-brand-gray">
          {getTypeIcon(recommendationType)}
          <span className="ml-1 capitalize">{recommendationType.replace('-', ' ')}</span>
        </div>
      </div>

      {/* Behavior Insights */}
      {behaviorData && showReasoning && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">Your Activity</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-blue-600">Products viewed:</span>
              <span className="ml-2 font-semibold">{behaviorData.viewedProducts.length}</span>
            </div>
            <div>
              <span className="text-blue-600">Favorites:</span>
              <span className="ml-2 font-semibold">{behaviorData.favoriteProducts.length}</span>
            </div>
            <div>
              <span className="text-blue-600">Comparisons:</span>
              <span className="ml-2 font-semibold">{behaviorData.comparedProducts.length}</span>
            </div>
            <div>
              <span className="text-blue-600">Engagement:</span>
              <span className="ml-2 font-semibold">{behaviorData.preferences.engagementLevel}/100</span>
            </div>
          </div>
          {reasoning && (
            <p className="text-sm text-blue-700 mt-3">{reasoning}</p>
          )}
        </div>
      )}

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((product) => (
          <div key={product.id} className="group">
            <Link href={`/products/${product.id}`} className="block">
              <div className="bg-gray-50 rounded-lg p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                {/* Product Image */}
                <div className="relative mb-4">
                  <img
                    src={product.featured_image_url || '/placeholder-product.png'}
                    alt={product.name}
                    className="w-full h-40 object-contain rounded-lg"
                  />
                  <BadgeDisplay
                    product={product}
                    size="xs"
                    overlay={true}
                  />
                </div>

                {/* Product Info */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-brand-dark group-hover:text-brand-teal transition-colors line-clamp-2">
                    {product.name}
                  </h4>
                  <p className="text-sm text-brand-gray">{product.brand_name}</p>

                  {/* Score and Price */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="text-sm font-medium">
                        {product.bifl_total_score?.toFixed(1) || 'N/A'}
                      </span>
                    </div>
                    {product.price && (
                      <span className="text-sm font-semibold text-brand-dark">
                        ${parseFloat(product.price).toFixed(0)}
                      </span>
                    )}
                  </div>

                  {/* Category */}
                  <p className="text-xs text-brand-gray bg-white px-2 py-1 rounded-full inline-block">
                    {product.category_name}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-brand-gray">
          <span>Powered by AI recommendations</span>
          <button
            onClick={loadRecommendations}
            className="flex items-center text-brand-teal hover:text-brand-teal/80 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </button>
        </div>
      </div>
    </div>
  )
}