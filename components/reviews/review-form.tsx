'use client'

import { useState } from 'react'
import { Star, Plus, X } from 'lucide-react'
import { useSession } from '@/components/auth/auth-client'
import { createClient } from '@/lib/supabase/client'

interface ReviewFormProps {
  productId: string
  onReviewSubmitted?: () => void
}

export function ReviewForm({ productId, onReviewSubmitted }: ReviewFormProps) {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [overallRating, setOverallRating] = useState(0)
  const [durabilityRating, setDurabilityRating] = useState(0)
  const [valueRating, setValueRating] = useState(0)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [pros, setPros] = useState([''])
  const [cons, setCons] = useState([''])
  const [yearsOwned, setYearsOwned] = useState('')
  const [stillWorks, setStillWorks] = useState<boolean | null>(null)
  const [wouldBuyAgain, setWouldBuyAgain] = useState<boolean | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user) {
      setError('You must be signed in to submit a review')
      return
    }

    if (overallRating === 0) {
      setError('Please select an overall rating')
      return
    }

    setLoading(true)
    setError('')

    try {
      const supabase = createClient()

      // Filter out empty pros and cons
      const filteredPros = pros.filter(pro => pro.trim() !== '')
      const filteredCons = cons.filter(con => con.trim() !== '')

      const reviewData = {
        product_id: productId,
        user_email: session.user.email!,
        user_name: session.user.name || null,
        overall_rating: overallRating,
        durability_rating: durabilityRating || null,
        value_rating: valueRating || null,
        title: title || null,
        content: content || null,
        pros: filteredPros,
        cons: filteredCons,
        years_owned: yearsOwned ? parseInt(yearsOwned) : null,
        still_works: stillWorks,
        would_buy_again: wouldBuyAgain,
        verified_purchase: false, // Will be handled separately for verification
        status: 'pending' // Requires moderation
      }

      const { error: insertError } = await supabase
        .from('reviews')
        .insert(reviewData)

      if (insertError) {
        throw insertError
      }

      // Reset form
      setOverallRating(0)
      setDurabilityRating(0)
      setValueRating(0)
      setTitle('')
      setContent('')
      setPros([''])
      setCons([''])
      setYearsOwned('')
      setStillWorks(null)
      setWouldBuyAgain(null)
      setIsOpen(false)

      onReviewSubmitted?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review')
    } finally {
      setLoading(false)
    }
  }

  const StarRating = ({ rating, setRating, label }: { rating: number; setRating: (rating: number) => void; label: string }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-brand-dark">{label}</label>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="focus:outline-none"
          >
            <Star
              className={`w-6 h-6 ${
                star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  )

  const addListItem = (list: string[], setList: (list: string[]) => void) => {
    setList([...list, ''])
  }

  const removeListItem = (index: number, list: string[], setList: (list: string[]) => void) => {
    const newList = list.filter((_, i) => i !== index)
    setList(newList.length === 0 ? [''] : newList)
  }

  const updateListItem = (index: number, value: string, list: string[], setList: (list: string[]) => void) => {
    const newList = [...list]
    newList[index] = value
    setList(newList)
  }

  if (!session?.user) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <p className="text-brand-gray mb-4">Sign in to write a review</p>
        <a
          href="/auth/signin"
          className="inline-block bg-brand-teal text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-opacity"
        >
          Sign In
        </a>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-brand-dark">Write a Review</h3>
              <p className="text-sm text-brand-gray">Share your experience with this product</p>
            </div>
            <Plus className="w-5 h-5 text-brand-gray" />
          </div>
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-brand-dark">Write a Review</h3>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-brand-gray hover:text-brand-dark"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
              {error}
            </div>
          )}

          {/* Ratings */}
          <div className="grid md:grid-cols-3 gap-6">
            <StarRating rating={overallRating} setRating={setOverallRating} label="Overall Rating *" />
            <StarRating rating={durabilityRating} setRating={setDurabilityRating} label="Durability" />
            <StarRating rating={valueRating} setRating={setValueRating} label="Value for Money" />
          </div>

          {/* Review Title */}
          <div>
            <label className="block text-sm font-medium text-brand-dark mb-2">Review Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-brand-teal focus:border-brand-teal"
              placeholder="Summarize your experience"
            />
          </div>

          {/* Review Content */}
          <div>
            <label className="block text-sm font-medium text-brand-dark mb-2">Detailed Review</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-brand-teal focus:border-brand-teal"
              placeholder="Tell us about your experience with this product..."
            />
          </div>

          {/* Pros and Cons */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-brand-dark mb-2">Pros</label>
              {pros.map((pro, index) => (
                <div key={index} className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={pro}
                    onChange={(e) => updateListItem(index, e.target.value, pros, setPros)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-brand-teal focus:border-brand-teal"
                    placeholder="What did you like?"
                  />
                  {pros.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeListItem(index, pros, setPros)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addListItem(pros, setPros)}
                className="text-brand-teal hover:text-opacity-80 text-sm"
              >
                + Add another pro
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-dark mb-2">Cons</label>
              {cons.map((con, index) => (
                <div key={index} className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={con}
                    onChange={(e) => updateListItem(index, e.target.value, cons, setCons)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-brand-teal focus:border-brand-teal"
                    placeholder="What could be improved?"
                  />
                  {cons.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeListItem(index, cons, setCons)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addListItem(cons, setCons)}
                className="text-brand-teal hover:text-opacity-80 text-sm"
              >
                + Add another con
              </button>
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-brand-dark mb-2">Years Owned</label>
              <input
                type="number"
                value={yearsOwned}
                onChange={(e) => setYearsOwned(e.target.value)}
                min="0"
                max="50"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-brand-teal focus:border-brand-teal"
                placeholder="How long have you owned it?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-dark mb-2">Still Working?</label>
              <select
                value={stillWorks === null ? '' : stillWorks.toString()}
                onChange={(e) => setStillWorks(e.target.value === '' ? null : e.target.value === 'true')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-brand-teal focus:border-brand-teal"
              >
                <option value="">Select...</option>
                <option value="true">Yes, still works great</option>
                <option value="false">No, no longer working</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-dark mb-2">Would Buy Again?</label>
              <select
                value={wouldBuyAgain === null ? '' : wouldBuyAgain.toString()}
                onChange={(e) => setWouldBuyAgain(e.target.value === '' ? null : e.target.value === 'true')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-brand-teal focus:border-brand-teal"
              >
                <option value="">Select...</option>
                <option value="true">Yes, definitely</option>
                <option value="false">No, would try something else</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading || overallRating === 0}
              className="flex-1 bg-brand-teal text-white py-3 px-4 rounded-lg hover:bg-opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-3 border border-gray-300 rounded-lg text-brand-gray hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>

          <p className="text-xs text-brand-gray">
            Your review will be moderated before appearing on the site. We verify all reviews to ensure authenticity.
          </p>
        </form>
      )}
    </div>
  )
}