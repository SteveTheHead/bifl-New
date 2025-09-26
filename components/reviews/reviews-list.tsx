'use client'

import { useState, useEffect } from 'react'
import { Star, ThumbsUp, Flag, Shield, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useSession } from '@/components/auth/auth-client'

interface Review {
  id: string
  product_id: string
  user_email: string
  user_name: string | null
  overall_rating: number
  durability_rating: number | null
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
  const { data: session } = useSession()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'>('newest')
  const [filterRating, setFilterRating] = useState<number | null>(null)

  useEffect(() => {
    fetchReviews()
  }, [productId, refreshTrigger, sortBy, filterRating])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      let query = supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('status', 'approved') // Only show approved reviews

      // Apply rating filter
      if (filterRating) {
        query = query.eq('overall_rating', filterRating)
      }

      // Apply sorting
      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false })
          break
        case 'oldest':
          query = query.order('created_at', { ascending: true })
          break
        case 'highest':
          query = query.order('overall_rating', { ascending: false })
          break
        case 'lowest':
          query = query.order('overall_rating', { ascending: true })
          break
        case 'helpful':
          query = query.order('helpful_count', { ascending: false })
          break
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching reviews:', error)
        return
      }

      setReviews(data || [])
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleHelpful = async (reviewId: string) => {
    if (!session?.user) return

    try {
      const supabase = createClient()

      // In a real implementation, you'd track which reviews a user has marked helpful
      // For now, just increment the count
      const { error } = await supabase
        .from('reviews')
        .update({ helpful_count: reviews.find(r => r.id === reviewId)!.helpful_count + 1 })
        .eq('id', reviewId)

      if (!error) {
        setReviews(reviews.map(r =>
          r.id === reviewId
            ? { ...r, helpful_count: r.helpful_count + 1 }
            : r
        ))
      }
    } catch (error) {
      console.error('Error marking review helpful:', error)
    }
  }

  const handleReport = async (reviewId: string) => {
    if (!session?.user) return

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('reviews')
        .update({ reported_count: reviews.find(r => r.id === reviewId)!.reported_count + 1 })
        .eq('id', reviewId)

      if (!error) {
        setReviews(reviews.map(r =>
          r.id === reviewId
            ? { ...r, reported_count: r.reported_count + 1 }
            : r
        ))
      }
    } catch (error) {
      console.error('Error reporting review:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const StarDisplay = ({ rating, size = 'w-4 h-4' }: { rating: number; size?: string }) => (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size} ${
            star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  )

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin rounded-full border-2 border-brand-teal border-t-transparent mx-auto"></div>
          <p className="text-brand-gray mt-2">Loading reviews...</p>
        </div>
      </div>
    )
  }

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.overall_rating, 0) / reviews.length
    : 0

  const ratingCounts = [5, 4, 3, 2, 1].map(rating =>
    reviews.filter(review => review.overall_rating === rating).length
  )

  return (
    <div className="space-y-6">
      {/* Review Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-brand-dark mb-2">Customer Reviews</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <StarDisplay rating={Math.round(averageRating)} size="w-5 h-5" />
                <span className="text-lg font-medium text-brand-dark">
                  {averageRating.toFixed(1)}
                </span>
                <span className="text-brand-gray">({reviews.length} reviews)</span>
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="mt-4 md:mt-0 space-y-1">
            {[5, 4, 3, 2, 1].map((rating, index) => (
              <div key={rating} className="flex items-center space-x-2 text-sm">
                <span className="w-8 text-brand-gray">{rating}★</span>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{
                      width: `${reviews.length > 0 ? (ratingCounts[index] / reviews.length) * 100 : 0}%`
                    }}
                  />
                </div>
                <span className="w-8 text-brand-gray text-right">{ratingCounts[index]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="text-sm font-medium text-brand-dark mr-2">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-brand-teal focus:border-brand-teal"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
              <option value="helpful">Most Helpful</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-brand-dark mr-2">Filter by rating:</label>
            <select
              value={filterRating || ''}
              onChange={(e) => setFilterRating(e.target.value ? parseInt(e.target.value) : null)}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-brand-teal focus:border-brand-teal"
            >
              <option value="">All ratings</option>
              <option value="5">5 stars</option>
              <option value="4">4 stars</option>
              <option value="3">3 stars</option>
              <option value="2">2 stars</option>
              <option value="1">1 star</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews */}
      {reviews.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-brand-gray text-lg">No reviews yet</p>
          <p className="text-brand-gray text-sm mt-2">Be the first to share your experience!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg border border-gray-200 p-6">
              {/* Review Header */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium text-brand-dark">
                      {review.user_name || 'Anonymous'}
                    </h4>
                    {review.verified_purchase && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <Shield className="w-4 h-4" />
                        <span className="text-xs font-medium">Verified Purchase</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-4 mb-2">
                    <StarDisplay rating={review.overall_rating} />
                    {review.durability_rating && (
                      <span className="text-sm text-brand-gray">
                        Durability: {review.durability_rating}/5
                      </span>
                    )}
                    {review.value_rating && (
                      <span className="text-sm text-brand-gray">
                        Value: {review.value_rating}/5
                      </span>
                    )}
                  </div>

                  {review.title && (
                    <h5 className="font-medium text-brand-dark mb-2">{review.title}</h5>
                  )}
                </div>

                <div className="text-sm text-brand-gray mt-2 md:mt-0">
                  {formatDate(review.created_at)}
                </div>
              </div>

              {/* Review Content */}
              {review.content && (
                <p className="text-brand-gray mb-4 leading-relaxed">{review.content}</p>
              )}

              {/* Pros and Cons */}
              {(review.pros.length > 0 || review.cons.length > 0) && (
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  {review.pros.length > 0 && (
                    <div>
                      <h6 className="font-medium text-green-600 mb-2">Pros:</h6>
                      <ul className="space-y-1">
                        {review.pros.map((pro, index) => (
                          <li key={index} className="text-sm text-brand-gray flex items-start">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {review.cons.length > 0 && (
                    <div>
                      <h6 className="font-medium text-red-600 mb-2">Cons:</h6>
                      <ul className="space-y-1">
                        {review.cons.map((con, index) => (
                          <li key={index} className="text-sm text-brand-gray flex items-start">
                            <span className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0">×</span>
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Additional Info */}
              <div className="flex flex-wrap gap-4 text-sm text-brand-gray mb-4">
                {review.years_owned && (
                  <span>Owned for {review.years_owned} year{review.years_owned !== 1 ? 's' : ''}</span>
                )}
                {review.still_works !== null && (
                  <span>Still working: {review.still_works ? 'Yes' : 'No'}</span>
                )}
                {review.would_buy_again !== null && (
                  <span>Would buy again: {review.would_buy_again ? 'Yes' : 'No'}</span>
                )}
              </div>

              {/* Review Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleHelpful(review.id)}
                    disabled={!session?.user}
                    className="flex items-center space-x-1 text-brand-gray hover:text-brand-dark disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span className="text-sm">Helpful ({review.helpful_count})</span>
                  </button>

                  <button
                    onClick={() => handleReport(review.id)}
                    disabled={!session?.user}
                    className="flex items-center space-x-1 text-brand-gray hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Flag className="w-4 h-4" />
                    <span className="text-sm">Report</span>
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