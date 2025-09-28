'use client'

import { useState, useEffect } from 'react'
import { BarChart3, X, Eye } from 'lucide-react'
import { useCompare } from '@/contexts/compare-context'

export function FloatingCompareBar() {
  const { compareProducts, clearCompare, setShowCompareModal } = useCompare()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted || compareProducts.length === 0) {
    return null
  }

  const handleViewComparison = () => {
    setShowCompareModal(true)
  }

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
      <div className="bg-brand-dark text-white px-6 py-3 rounded-full shadow-lg border border-white/20 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          {/* Product Count */}
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" style={{ color: '#000000' }} />
            <span className="font-medium" style={{ color: '#000000' }}>
              {compareProducts.length} Product{compareProducts.length !== 1 ? 's' : ''} to Compare
            </span>
          </div>

          {/* Product Thumbnails */}
          <div className="flex -space-x-2">
            {compareProducts.map((product, index) => (
              <div
                key={product.id}
                className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-white"
                style={{ zIndex: compareProducts.length - index }}
              >
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <div
                      className="text-xs font-medium"
                      style={{
                        color: '#ffffff',
                        fontWeight: '600',
                        fontSize: '12px'
                      }}
                    >
                      {product.name.charAt(0)}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {compareProducts.length >= 2 && (
              <button
                onClick={handleViewComparison}
                className="bg-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors"
                style={{ color: '#000000' }}
              >
                <Eye className="w-4 h-4 inline mr-1" />
                Compare
              </button>
            )}

            <button
              onClick={clearCompare}
              className="transition-colors p-1"
              style={{ color: '#000000' }}
              title="Clear all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}