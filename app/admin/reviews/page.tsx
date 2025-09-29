'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Check,
  X,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  MessageSquare
} from 'lucide-react'

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
  product?: {
    name: string
  }
}

// Score pill component matching the site design
function ScorePill({ rating }: { rating: number }) {
  const getScoreGradient = (score: number) => {
    if (score === 10.0) return 'linear-gradient(135deg, #00ff00, #00dd00)'
    if (score >= 9.0) return 'linear-gradient(135deg, #00ff88, #00cc66)'
    if (score >= 8.0) return 'linear-gradient(135deg, #a3ffbf, #66ff99)'
    if (score >= 7.0) return 'linear-gradient(135deg, #fff886, #fbd786)'
    if (score >= 6.0) return 'linear-gradient(135deg, #ffb347, #ff9966)'
    return 'linear-gradient(135deg, #ff4c4c, #ff6e7f)'
  }

  const getScoreTextColor = (score: number) => {
    if (score >= 6.0) return '#1a1a1a'
    return 'white'
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

export default function AdminReviews() {
  const router = useRouter()
  const [session, setSession] = useState<{name?: string; email?: string; isAdmin?: boolean} | null>(null)
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState<Review[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const checkSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/simple-session')
      const data = await response.json()

      if (data.isAuthenticated && data.user?.isAdmin) {
        setSession(data.user)
        setLoading(false)
      } else {
        router.push('/auth/signin')
      }
    } catch (error) {
      console.error('Session check error:', error)
      router.push('/auth/signin')
    }
  }, [router])

  const fetchReviews = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/reviews?filter=${filter}`)
      const data = await response.json()
      setReviews(data.reviews || [])
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    }
  }, [filter])

  useEffect(() => {
    checkSession()
  }, [checkSession])

  useEffect(() => {
    if (session) {
      fetchReviews()
    }
  }, [session, fetchReviews])

  const handleReviewAction = async (reviewId: string, action: 'approve' | 'reject') => {
    setActionLoading(reviewId)
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        await fetchReviews()
        if (selectedReview?.id === reviewId) {
          setSelectedReview(null)
        }
      }
    } catch (error) {
      console.error('Failed to update review:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin"
                className="flex items-center text-brand-gray hover:text-brand-dark"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-brand-dark">Review Management</h1>
            </div>
            <div className="text-sm text-brand-gray">
              {reviews.length} {filter === 'all' ? 'total' : filter} reviews
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="flex border-b border-gray-200">
            {[
              { key: 'pending', label: 'Pending', count: reviews.filter(r => r.status === 'pending').length },
              { key: 'approved', label: 'Approved', count: reviews.filter(r => r.status === 'approved').length },
              { key: 'rejected', label: 'Rejected', count: reviews.filter(r => r.status === 'rejected').length },
              { key: 'all', label: 'All', count: reviews.length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as 'all' | 'pending' | 'approved' | 'rejected')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  filter === tab.key
                    ? 'border-brand-teal text-brand-teal'
                    : 'border-transparent text-brand-gray hover:text-brand-dark'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Reviews List Panel */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-brand-gray">No {filter === 'all' ? '' : filter} reviews found</p>
              </div>
            ) : (
              reviews.map((review) => (
                <div
                  key={review.id}
                  className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer ${
                    selectedReview?.id === review.id ? 'ring-2 ring-brand-teal' : ''
                  }`}
                  onClick={() => setSelectedReview(review)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(review.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(review.status)}`}>
                          {review.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-brand-gray">
                      <Calendar className="w-3 h-3" />
                      {new Date(review.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="mb-3">
                    <h3 className="font-bold text-brand-dark text-sm mb-1">
                      {review.title || 'Untitled Review'}
                    </h3>
                    <p className="text-brand-gray text-sm">
                      Product: {review.product?.name || `Product ID: ${review.product_id}`}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <User className="w-3 h-3 text-brand-gray" />
                      <span className="text-xs text-brand-gray">
                        {review.user_name || review.user_email}
                      </span>
                    </div>
                  </div>

                  {review.content && (
                    <p className="text-brand-gray text-sm mb-3 line-clamp-2">
                      {review.content}
                    </p>
                  )}

                  {/* Rating Pills */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {review.durability_rating && (
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-brand-gray">Durability:</span>
                        <ScorePill rating={review.durability_rating * 2} />
                      </div>
                    )}
                    {review.repairability_rating && (
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-brand-gray">Repair:</span>
                        <ScorePill rating={review.repairability_rating * 2} />
                      </div>
                    )}
                    {review.warranty_rating && (
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-brand-gray">Warranty:</span>
                        <ScorePill rating={review.warranty_rating * 2} />
                      </div>
                    )}
                    {review.value_rating && (
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-brand-gray">Experience:</span>
                        <ScorePill rating={review.value_rating * 2} />
                      </div>
                    )}
                  </div>

                  {/* Actions for pending reviews */}
                  {review.status === 'pending' && (
                    <div className="flex space-x-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleReviewAction(review.id, 'approve')
                        }}
                        disabled={actionLoading === review.id}
                        className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-xs font-medium"
                      >
                        <Check className="w-3 h-3" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleReviewAction(review.id, 'reject')
                        }}
                        disabled={actionLoading === review.id}
                        className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-xs font-medium"
                      >
                        <X className="w-3 h-3" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Review Details Panel */}
          <div className="lg:sticky lg:top-8">
            {selectedReview ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-brand-dark">Review Details</h2>
                  <button
                    onClick={() => setSelectedReview(null)}
                    className="text-brand-gray hover:text-brand-dark"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Status and Basic Info */}
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      {getStatusIcon(selectedReview.status)}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedReview.status)}`}>
                        {selectedReview.status}
                      </span>
                    </div>
                    <p className="text-sm text-brand-gray">
                      Submitted on {new Date(selectedReview.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Review Title and Content */}
                  <div>
                    <h3 className="font-bold text-brand-dark mb-2">
                      {selectedReview.title || 'Untitled Review'}
                    </h3>
                    {selectedReview.content && (
                      <p className="text-brand-gray text-sm mb-3">
                        {selectedReview.content}
                      </p>
                    )}
                  </div>

                  {/* All Rating Pills */}
                  <div>
                    <h4 className="font-medium text-brand-dark mb-2">Ratings</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedReview.durability_rating && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-brand-gray">Durability:</span>
                          <ScorePill rating={selectedReview.durability_rating * 2} />
                        </div>
                      )}
                      {selectedReview.repairability_rating && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-brand-gray">Repair:</span>
                          <ScorePill rating={selectedReview.repairability_rating * 2} />
                        </div>
                      )}
                      {selectedReview.warranty_rating && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-brand-gray">Warranty:</span>
                          <ScorePill rating={selectedReview.warranty_rating * 2} />
                        </div>
                      )}
                      {selectedReview.value_rating && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-brand-gray">Experience:</span>
                          <ScorePill rating={selectedReview.value_rating * 2} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pros and Cons */}
                  {(selectedReview.pros?.length > 0 || selectedReview.cons?.length > 0) && (
                    <div>
                      <h4 className="font-medium text-brand-dark mb-2">Pros & Cons</h4>
                      <div className="space-y-2">
                        {selectedReview.pros?.length > 0 && (
                          <div>
                            <span className="font-medium text-green-700 text-sm">Pros: </span>
                            <span className="text-brand-gray text-sm">{selectedReview.pros.join(', ')}</span>
                          </div>
                        )}
                        {selectedReview.cons?.length > 0 && (
                          <div>
                            <span className="font-medium text-red-700 text-sm">Cons: </span>
                            <span className="text-brand-gray text-sm">{selectedReview.cons.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* User Info */}
                  <div>
                    <h4 className="font-medium text-brand-dark mb-2">User Information</h4>
                    <div className="space-y-1 text-sm">
                      <p className="text-brand-gray">
                        Name: {selectedReview.user_name || 'Not provided'}
                      </p>
                      <p className="text-brand-gray">
                        Email: {selectedReview.user_email}
                      </p>
                      <p className="text-brand-gray">
                        Verified Purchase: {selectedReview.verified_purchase ? 'Yes' : 'No'}
                      </p>
                      {selectedReview.years_owned && (
                        <p className="text-brand-gray">
                          Years Owned: {selectedReview.years_owned}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {selectedReview.status === 'pending' && (
                    <div className="flex space-x-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleReviewAction(selectedReview.id, 'approve')}
                        disabled={actionLoading === selectedReview.id}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve Review</span>
                      </button>
                      <button
                        onClick={() => handleReviewAction(selectedReview.id, 'reject')}
                        disabled={actionLoading === selectedReview.id}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                      >
                        <X className="w-4 h-4" />
                        <span>Reject Review</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                <Eye className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-brand-gray">Select a review to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}