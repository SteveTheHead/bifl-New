'use client'

import { useState, useEffect } from 'react'
import { Check, X } from 'lucide-react'

interface ProductProsConsProps {
  productId: string
}

interface ProsCons {
  pros: string[]
  cons: string[]
  reviewCount: number
}

export function ProductProsCons({ productId }: ProductProsConsProps) {
  const [prosConsData, setProsConsData] = useState<ProsCons | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProsConsData() {
      try {
        const response = await fetch(`/api/reviews/${productId}/pros-cons`)
        if (response.ok) {
          const data = await response.json()
          setProsConsData(data)
        }
      } catch (error) {
        console.error('Failed to fetch pros/cons data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProsConsData()
  }, [productId])

  if (loading) {
    return (
      <section className="mt-16 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-center">Community Insights</h2>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-gray-200 h-48 rounded-xl"></div>
            <div className="bg-gray-200 h-48 rounded-xl"></div>
          </div>
        </div>
      </section>
    )
  }

  if (!prosConsData || prosConsData.reviewCount === 0 || (prosConsData.pros.length === 0 && prosConsData.cons.length === 0)) {
    return null
  }

  const { pros, cons, reviewCount } = prosConsData

  return (
    <section className="mt-16 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-center">Community Insights</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Pros Column */}
        <div className="bg-gradient-to-br from-green-50 to-teal-50 p-6 rounded-xl border border-teal-100">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center mr-3">
              <Check className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-teal-800">What Users Love</h3>
          </div>

          <div className="space-y-3">
            {pros.length > 0 ? (
              pros.map((pro, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700 leading-relaxed">{pro}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-600 italic">No specific pros mentioned yet</p>
            )}
          </div>
        </div>

        {/* Cons Column */}
        <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-xl border border-red-100">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3">
              <X className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-red-800">Areas for Improvement</h3>
          </div>

          <div className="space-y-3">
            {cons.length > 0 ? (
              cons.map((con, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700 leading-relaxed">{con}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-600 italic">No specific cons mentioned yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Based on insights from <span className="font-semibold text-brand-dark">{reviewCount}</span> detailed {reviewCount === 1 ? 'review' : 'reviews'}
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Pros and cons are aggregated from verified user reviews to help you make informed decisions
        </p>
      </div>
    </section>
  )
}