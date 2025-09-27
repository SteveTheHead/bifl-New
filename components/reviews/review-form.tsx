'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, X } from 'lucide-react'
import { useSession } from '@/components/auth/auth-client'
import { createClient } from '@/lib/supabase/client'

// Simple list component for pros/cons
function SimpleList({ items, setItems, placeholder }: { items: string[]; setItems: (items: string[]) => void; placeholder: string }) {
  const addItem = () => setItems([...items, ''])

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index)
    setItems(newItems.length === 0 ? [''] : newItems)
  }

  const updateItem = (index: number, value: string) => {
    const newItems = [...items]
    newItems[index] = value
    setItems(newItems)
  }

  return (
    <div className="space-y-1">
      {items.map((item, index) => (
        <div key={index} className="flex space-x-1">
          <input
            type="text"
            value={item}
            onChange={(e) => updateItem(index, e.target.value)}
            className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal"
            placeholder={placeholder}
          />
          {items.length > 1 && (
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="text-red-500 hover:text-red-700 px-1 flex-shrink-0"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      ))}
      {items.length < 5 && (
        <button
          type="button"
          onClick={addItem}
          className="text-brand-teal hover:text-opacity-80 text-xs underline"
        >
          + Add
        </button>
      )}
    </div>
  )
}

// Get color and gradient based on score (exactly matching pill styling)
function getScoreColor(score: number) {
  if (score === 10.0) return 'linear-gradient(135deg, #00ff00, #00dd00)' // Perfect 10
  if (score >= 9.0) return 'linear-gradient(135deg, #00ff88, #00cc66)' // 9.x
  if (score >= 8.0) return 'linear-gradient(135deg, #a3ffbf, #66ff99)' // 8.x
  if (score >= 7.0) return 'linear-gradient(135deg, #fff886, #fbd786)' // 7.x
  if (score >= 6.0) return 'linear-gradient(135deg, #ffb347, #ff9966)' // 6.x
  return 'linear-gradient(135deg, #ff4c4c, #ff6e7f)' // 0-5.9
}

// Get solid color for slider thumb (middle color of gradient)
function getScoreSolidColor(score: number) {
  if (score === 10.0) return '#00ee00' // Perfect 10
  if (score >= 9.0) return '#00dd77' // 9.x
  if (score >= 8.0) return '#84ffaa' // 8.x
  if (score >= 7.0) return '#fbeb86' // 7.x
  if (score >= 6.0) return '#ffaa56' // 6.x
  return '#ff5d6a' // 0-5.9
}

// Get text color (same as pills)
function getScoreTextColor(score: number) {
  if (score >= 6.0) return '#1a1a1a' // Dark text for light backgrounds
  return 'white' // White text for dark/red backgrounds
}

interface ReviewFormProps {
  productId: string
  onReviewSubmitted?: () => void
}

export function ReviewForm({ productId, onReviewSubmitted }: ReviewFormProps) {
  const { data: session } = useSession()
  const [isClient, setIsClient] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form state - using 0.5 increments to match BIFL scoring
  const [durabilityRating, setDurabilityRating] = useState(0)
  const [repairabilityRating, setRepairabilityRating] = useState(0)
  const [warrantyRating, setWarrantyRating] = useState(0)
  const [personalExperienceRating, setPersonalExperienceRating] = useState(0)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [pros, setPros] = useState([''])
  const [cons, setCons] = useState([''])
  const [yearsOwned, setYearsOwned] = useState('')
  const [stillWorks, setStillWorks] = useState<boolean | null>(null)
  const [wouldBuyAgain, setWouldBuyAgain] = useState<boolean | null>(null)

  // Fix hydration mismatch by only rendering on client
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Don't render anything until client-side
  if (!isClient) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-72"></div>
        </div>
      </div>
    )
  }

  // Mock user for development/testing - only on client
  const mockUser = process.env.NODE_ENV === 'development' ? {
    user: {
      email: 'testuser@bifl.dev',
      name: 'Test User'
    }
  } : null

  const currentSession = session || mockUser

  // Debug logging
  console.log('ReviewForm render:', { session, mockUser, currentSession, productId, isClient })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submission started:', { currentSession, productId })

    if (!currentSession?.user) {
      console.log('No user session found')
      setError('You must be signed in to submit a review')
      return
    }

    // Validation - check required fields
    if (durabilityRating === 0 && repairabilityRating === 0 && warrantyRating === 0 && personalExperienceRating === 0) {
      setError('Please provide at least one rating')
      return
    }

    if (!title.trim()) {
      setError('Please provide a review title')
      return
    }

    if (!content.trim()) {
      setError('Please provide a detailed review')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Filter out empty pros and cons
      const filteredPros = pros.filter(pro => pro.trim() !== '')
      const filteredCons = cons.filter(con => con.trim() !== '')

      // The database likely expects ratings 1-5 or 1-10, let's try a simpler approach
      const convertRatingForDB = (rating: number) => {
        if (rating === 0) return null
        // Convert 0-10 scale to 1-5 scale for legacy database
        return Math.max(1, Math.min(5, Math.round(rating / 2)))
      }

      const reviewData = {
        product_id: productId,
        user_email: currentSession.user.email,
        user_name: currentSession.user.name || 'Test User',
        overall_rating: convertRatingForDB(Math.max(durabilityRating, repairabilityRating, warrantyRating, personalExperienceRating)) || 3,
        durability_rating: convertRatingForDB(durabilityRating),
        repairability_rating: convertRatingForDB(repairabilityRating),
        warranty_rating: convertRatingForDB(warrantyRating),
        value_rating: convertRatingForDB(personalExperienceRating),
        title: title,
        content: content,
        pros: filteredPros,
        cons: filteredCons,
        years_owned: yearsOwned ? parseInt(yearsOwned) : null,
        still_works: stillWorks,
        would_buy_again: wouldBuyAgain,
        verified_purchase: false,
        status: 'pending'
      }

      console.log('Submitting review via API:', reviewData)

      // Submit via API route to bypass RLS
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData)
      })

      console.log('Response status:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API error response:', errorText)
        throw new Error(`Failed to submit review: ${response.status}`)
      }

      const result = await response.json()
      console.log('API response:', result)

      if (!result.success) {
        throw new Error(result.error || 'Failed to submit review')
      }

      console.log('Review submitted successfully!')

      // Reset form
      setDurabilityRating(0)
      setRepairabilityRating(0)
      setWarrantyRating(0)
      setPersonalExperienceRating(0)
      setTitle('')
      setContent('')
      setPros([''])
      setCons([''])
      setYearsOwned('')
      setStillWorks(null)
      setWouldBuyAgain(null)
      setIsOpen(false)

      // Show success message
      setError('')
      alert('Review submitted successfully! It will appear after moderation.')

      console.log('Calling onReviewSubmitted to refresh reviews list...')
      onReviewSubmitted?.()
    } catch (err) {
      console.error('Caught error:', err)
      console.error('Error type:', typeof err)
      console.error('Error constructor:', err?.constructor?.name)
      console.error('Error message:', err?.message)
      console.error('Error string:', String(err))
      console.error('Error JSON:', JSON.stringify(err, null, 2))

      setError(err instanceof Error ? err.message : 'Failed to submit review')
    } finally {
      setLoading(false)
    }
  }

  const CompactSlider = ({ rating, setRating, label }: { rating: number; setRating: (rating: number) => void; label: string }) => {
    const sliderGradient = getScoreColor(rating)
    const sliderSolidColor = getScoreSolidColor(rating)
    const textColor = getScoreTextColor(rating)

    return (
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <label className="text-xs font-medium text-brand-dark">{label}</label>
          <span
            className="text-xs font-bold px-3 py-1 rounded-full"
            style={{
              background: rating > 0 ? sliderGradient : '#9CA3AF',
              color: rating > 0 ? textColor : 'white',
              minWidth: '32px',
              textAlign: 'center'
            }}
          >
            {rating > 0 ? rating.toFixed(1) : '-'}
          </span>
        </div>
        <div className="relative">
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={rating}
            onChange={(e) => setRating(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded appearance-none cursor-pointer compact-slider"
            style={{
              background: rating > 0
                ? `linear-gradient(to right, ${sliderSolidColor} 0%, ${sliderSolidColor} ${rating * 10}%, #e5e7eb ${rating * 10}%, #e5e7eb 100%)`
                : '#e5e7eb'
            }}
          />
        </div>
        <style jsx>{`
          .compact-slider::-webkit-slider-thumb {
            appearance: none;
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: ${sliderSolidColor};
            cursor: pointer;
            border: 1px solid white;
            box-shadow: 0 1px 2px rgba(0,0,0,0.2);
          }
          .compact-slider::-moz-range-thumb {
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: ${sliderSolidColor};
            cursor: pointer;
            border: 1px solid white;
            box-shadow: 0 1px 2px rgba(0,0,0,0.2);
            border: none;
          }
        `}</style>
      </div>
    )
  }


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

  if (!currentSession?.user) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <p className="text-brand-gray mb-4">Sign in to write a review</p>
        {process.env.NODE_ENV === 'development' ? (
          <div className="space-y-2">
            <p className="text-sm text-blue-600">Development Mode: Authentication disabled for testing</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-block bg-brand-teal text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-opacity"
            >
              Refresh to Use Test User
            </button>
          </div>
        ) : (
          <a
            href="/sign-in"
            className="inline-block bg-brand-teal text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-opacity"
          >
            Sign In
          </a>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full text-left hover:bg-gray-50 transition-colors -m-4 p-4 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-brand-dark">Write a Review</h3>
              <p className="text-xs text-brand-gray">Share your experience</p>
            </div>
            <Plus className="w-4 h-4 text-brand-gray" />
          </div>
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium text-brand-dark">Write a Review</h3>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-brand-gray hover:text-brand-dark"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {error && (
            <div className="text-red-600 text-xs bg-red-50 border border-red-200 rounded p-2">
              {error}
            </div>
          )}

          {/* Compact Ratings Grid */}
          <div className="space-y-3">
            <div className="mb-1">
              <span className="text-xs font-medium text-brand-dark">
                Ratings <span className="text-red-500">*</span>
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <CompactSlider rating={durabilityRating} setRating={setDurabilityRating} label="Durability" />
              <CompactSlider rating={repairabilityRating} setRating={setRepairabilityRating} label="Repair" />
              <CompactSlider rating={warrantyRating} setRating={setWarrantyRating} label="Warranty" />
              <CompactSlider rating={personalExperienceRating} setRating={setPersonalExperienceRating} label="Experience" />
            </div>
          </div>

          {/* Compact Title and Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-brand-dark mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal"
                placeholder="Review title"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-dark mb-1">
                Experience <span className="text-red-500">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={2}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal"
                placeholder="Your experience..."
                required
              />
            </div>
          </div>

          {/* Compact Pros/Cons */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-brand-dark mb-1">Pros</label>
              <textarea
                value={pros.join('\n')}
                onChange={(e) => setPros(e.target.value.split('\n').filter(line => line.trim() !== ''))}
                rows={2}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal"
                placeholder="What you liked (one per line)"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-dark mb-1">Cons</label>
              <textarea
                value={cons.join('\n')}
                onChange={(e) => setCons(e.target.value.split('\n').filter(line => line.trim() !== ''))}
                rows={2}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal"
                placeholder="What could improve (one per line)"
              />
            </div>
          </div>

          {/* Compact Additional Info */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-medium text-brand-dark mb-1">Years</label>
              <input
                type="number"
                value={yearsOwned}
                onChange={(e) => setYearsOwned(e.target.value)}
                min="0"
                max="50"
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-brand-teal"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-brand-dark mb-1">Works?</label>
              <select
                value={stillWorks === null ? '' : stillWorks.toString()}
                onChange={(e) => setStillWorks(e.target.value === '' ? null : e.target.value === 'true')}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-brand-teal"
              >
                <option value="">-</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-brand-dark mb-1">Buy Again?</label>
              <select
                value={wouldBuyAgain === null ? '' : wouldBuyAgain.toString()}
                onChange={(e) => setWouldBuyAgain(e.target.value === '' ? null : e.target.value === 'true')}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-brand-teal"
              >
                <option value="">-</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>

          {/* Compact Submit */}
          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="submit"
              disabled={loading || (durabilityRating === 0 && repairabilityRating === 0 && warrantyRating === 0 && personalExperienceRating === 0) || !title.trim() || !content.trim()}
              className="px-4 py-2 rounded text-sm font-medium transition-all"
              style={{
                backgroundColor: '#4A9D93',
                color: 'white',
                opacity: (loading || (durabilityRating === 0 && repairabilityRating === 0 && warrantyRating === 0 && personalExperienceRating === 0) || !title.trim() || !content.trim()) ? 0.5 : 1,
                cursor: (loading || (durabilityRating === 0 && repairabilityRating === 0 && warrantyRating === 0 && personalExperienceRating === 0) || !title.trim() || !content.trim()) ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded text-sm text-brand-gray hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>

          <p className="text-xs text-brand-gray">
            Reviews are moderated before appearing.
          </p>
        </form>
      )}
    </div>
  )
}