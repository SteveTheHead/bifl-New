'use client'

import { useState, useEffect, useCallback } from 'react'
import { ThumbsUp, Flag, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useSession } from '@/components/auth/auth-client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { sb } from '@/lib/supabase-utils'


// Pill score display component (matching site-wide styling with dynamic gradient)
function ScorePill({ rating }: { rating: number }) {
  // Get the dynamic gradient background based on score
  const getScoreGradient = (score: number) => {
    if (score === 10.0) return 'linear-gradient(135deg, #00ff00, #00dd00)' // Perfect 10
    if (score >= 9.0) return 'linear-gradient(135deg, #00ff88, #00cc66)' // 9.x
    if (score >= 8.0) return 'linear-gradient(135deg, #a3ffbf, #66ff99)' // 8.x
    if (score >= 7.0) return 'linear-gradient(135deg, #fff886, #fbd786)' // 7.x
    if (score >= 6.0) return 'linear-gradient(135deg, #ffb347, #ff9966)' // 6.x
    return 'linear-gradient(135deg, #ff4c4c, #ff6e7f)' // 0-5.9
  }

  const getScoreTextColor = (score: number) => {
    if (score >= 6.0) return '#1a1a1a' // Dark text for light backgrounds
    return 'white' // White text for dark/red backgrounds
  }

  return (
    <div
      className="px-3 py-1 rounded-full text-xs font-bold"
      style={{
        background: getScoreGradient(rating),
        color: getScoreTextColor(rating),
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
    >
      {rating.toFixed(1)}
    </div>
  )
}

interface Review {
  id: string
  product_id: string
  user_email: string
  user_name: string | null
  overall_rating: number
  durability_rating: number | null
  repairability_rating: number | null
  warranty_rating: number | null
  value_rating: number | null
  title: string | null
  content: string | null
  pros: string[]
  cons: string[]
  years_owned: number | null
  still_works: boolean | null
  would_buy_again: boolean | null
  verified_purchase: boolean
  status: string
  helpful_count: number
  reported_count: number
  created_at: string
  updated_at: string
}

interface ReviewsListProps {
  productId: string
  refreshTrigger?: number
}

export function ReviewsList({ productId, refreshTrigger }: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isReviewsSectionExpanded, setIsReviewsSectionExpanded] = useState(false)
  const { data: session } = useSession()
  const supabase = createClient()

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('ReviewsList: Starting fetch for productId:', productId)

      const response = await fetch(`/api/reviews/${productId}`)
      const result = await response.json()

      console.log('ReviewsList: API response:', result)

      if (!response.ok) {
        setError(`Failed to load reviews: ${result.error || 'Unknown error'}`)
        return
      }

      console.log('ReviewsList: Setting reviews data:', result.reviews?.length || 0, 'reviews')
      setReviews(result.reviews || [])
    } catch (err) {
      console.error('Error:', err)
      setError(`Failed to load reviews: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const handleHelpful = async (reviewId: string) => {
    if (!session?.user) return

    try {
      const { error } = await sb.rpc(supabase, 'increment_helpful_count', {
        review_id: reviewId
      })

      if (error) {
        console.error('Error marking review as helpful:', error)
        return
      }

      // Refresh reviews to show updated count
      fetchReviews()
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const handleReport = async (reviewId: string) => {
    if (!session?.user) return

    try {
      const { error } = await sb.rpc(supabase, 'increment_report_count', {
        review_id: reviewId
      })

      if (error) {
        console.error('Error reporting review:', error)
        return
      }

      // Refresh reviews to show updated count
      fetchReviews()
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const toggleReviewsSection = () => {
    setIsReviewsSectionExpanded(prev => !prev)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-red-600 text-center">
          <p>{error}</p>
          <button
            onClick={fetchReviews}
            className="mt-2 text-brand-teal hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <h3 className="text-lg font-medium text-brand-dark mb-2">No reviews yet</h3>
        <p className="text-brand-gray">Be the first to review this product!</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* Collapsible Reviews Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-brand-dark">
          Reviews ({reviews.length})
        </h2>
        <button
          onClick={toggleReviewsSection}
          className="text-brand-gray hover:text-brand-dark transition-colors"
        >
          {isReviewsSectionExpanded ? (
            <ChevronUp className="w-6 h-6" />
          ) : (
            <ChevronDown className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Collapsible Reviews Content */}
      {isReviewsSectionExpanded && (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border border-gray-100 rounded-lg p-4 hover:shadow-sm transition-shadow">
              {/* Review Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    {review.user_email === 'testuser@bifl.dev' ? (
                      <AvatarImage
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=TestUser&backgroundColor=b6e3f4&clothesColor=2563eb&eyebrowType=default&eyeType=happy&mouthType=smile"
                        alt="Test User Avatar"
                      />
                    ) : null}
                    <AvatarFallback className="bg-brand-teal text-white text-sm font-medium">
                      {(review.user_name || review.user_email || 'A').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-brand-dark text-sm">
                      {review.user_name || 'Anonymous'}
                    </span>
                    {review.verified_purchase && (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                    {process.env.NODE_ENV === 'development' && review.status === 'pending' && (
                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-brand-gray">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Review Title */}
              {review.title && (
                <h5 className="font-bold text-brand-dark text-sm mb-1">{review.title}</h5>
              )}

              {/* Review Content */}
              {review.content && (
                <p className="text-brand-gray text-sm mb-3">{review.content}</p>
              )}

              {/* Rating Pills */}
              <div className="flex flex-wrap gap-2 mb-3">
                {review.durability_rating !== null && review.durability_rating !== undefined && (
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-brand-gray">Durability:</span>
                    <ScorePill rating={review.durability_rating * 2} />
                  </div>
                )}
                {review.repairability_rating !== null && review.repairability_rating !== undefined && (
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-brand-gray">Repair:</span>
                    <ScorePill rating={review.repairability_rating * 2} />
                  </div>
                )}
                {review.warranty_rating !== null && review.warranty_rating !== undefined && (
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-brand-gray">Warranty:</span>
                    <ScorePill rating={review.warranty_rating * 2} />
                  </div>
                )}
                {review.value_rating !== null && review.value_rating !== undefined && (
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-brand-gray">Experience:</span>
                    <ScorePill rating={review.value_rating * 2} />
                  </div>
                )}
              </div>

              {/* Pros/Cons */}
              {(review.pros?.length > 0 || review.cons?.length > 0) && (
                <div className="mb-3 text-xs space-y-1">
                  {review.pros?.length > 0 && (
                    <div>
                      <span className="font-medium text-green-700">Pros: </span>
                      <span className="text-brand-gray">{review.pros.join(', ')}</span>
                    </div>
                  )}
                  {review.cons?.length > 0 && (
                    <div>
                      <span className="font-medium text-red-700">Cons: </span>
                      <span className="text-brand-gray">{review.cons.join(', ')}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Bottom row - status indicators and actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-xs">
                  {review.still_works !== null && (
                    <span className={review.still_works ? 'text-green-600' : 'text-red-600'}>
                      {review.still_works ? '✓ Works' : '✗ Broken'}
                    </span>
                  )}
                  {review.would_buy_again !== null && (
                    <span className={review.would_buy_again ? 'text-green-600' : 'text-red-600'}>
                      {review.would_buy_again ? '✓ Buy again' : '✗ Won\'t buy'}
                    </span>
                  )}
                  {review.years_owned && (
                    <span className="text-brand-gray">
                      {review.years_owned}y owned
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleHelpful(review.id)}
                    disabled={!session?.user}
                    className="flex items-center space-x-1 text-brand-gray hover:text-brand-teal disabled:opacity-50 text-xs"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>{review.helpful_count}</span>
                  </button>

                  <button
                    onClick={() => handleReport(review.id)}
                    disabled={!session?.user}
                    className="flex items-center space-x-1 text-brand-gray hover:text-red-600 disabled:opacity-50 text-xs"
                  >
                    <Flag className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}