'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { FavoriteIcon } from '../favorites/favorite-button'
import BadgeDisplay from '@/components/BadgeDisplay'

function getScoreBadgeStyle(score: number) {
  const scoreString = score.toString()
  return {
    className: "score-field px-3 py-1 rounded-full transform transition-all duration-300",
    dataScore: scoreString
  }
}

interface SimilarProductsCarouselProps {
  currentProductId: string
  categoryId?: string
}

export function SimilarProductsCarousel({ currentProductId, categoryId }: SimilarProductsCarouselProps) {
  const [products, setProducts] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  const itemsPerView = 3 // Show 3 products at a time
  const maxIndex = Math.max(0, products.length - itemsPerView)

  useEffect(() => {
    async function fetchSimilarProducts() {
      try {
        setLoading(true)

        // Use the new improved related products API endpoint
        const response = await fetch(`/api/products/${currentProductId}/related`)

        if (!response.ok) {
          throw new Error('Failed to fetch related products')
        }

        const data = await response.json()

        // The API returns only 2 products for detailed comparison,
        // but we want more for the carousel, so we'll supplement with additional products
        let relatedProducts = data.products || []

        // If we have fewer than 6 products, get additional ones using the old method
        if (relatedProducts.length < 6) {
          const supabase = createClient()

          // Get the IDs we already have to avoid duplicates
          const existingIds = relatedProducts.map((p: any) => p.id)
          const excludeIds = [currentProductId, ...existingIds]

          // Get additional products from the same category or similar categories
          let query = supabase
            .from('products_with_taxonomy')
            .select('*')
            .eq('status', 'published')
            .not('id', 'in', `(${excludeIds.join(',')})`)

          // If we have a category, prioritize products from the same category
          if (categoryId) {
            query = query.eq('category_id', categoryId)
          }

          const { data: additionalData, error } = await query
            .order('bifl_total_score', { ascending: false })
            .limit(6 - relatedProducts.length)

          if (!error && additionalData) {
            relatedProducts = [...relatedProducts, ...additionalData]
          }

          // If still not enough and we were filtering by category, get from any category
          if (relatedProducts.length < 6 && categoryId) {
            const stillNeedCount = 6 - relatedProducts.length
            const allExcludeIds = [currentProductId, ...relatedProducts.map((p: any) => p.id)]

            const { data: anyCategory, error: anyCategoryError } = await supabase
              .from('products_with_taxonomy')
              .select('*')
              .eq('status', 'published')
              .not('id', 'in', `(${allExcludeIds.join(',')})`)
              .order('bifl_total_score', { ascending: false })
              .limit(stillNeedCount)

            if (!anyCategoryError && anyCategory) {
              relatedProducts = [...relatedProducts, ...anyCategory]
            }
          }
        }

        setProducts(relatedProducts)
      } catch (error) {
        console.error('Error fetching similar products:', error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchSimilarProducts()
  }, [currentProductId, categoryId])

  const nextSlide = () => {
    setCurrentIndex(prev => Math.min(prev + 1, maxIndex))
  }

  const prevSlide = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0))
  }

  if (loading) {
    return (
      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-6 text-center">Similar Products</h2>
        <div className="flex items-center justify-center py-12">
          <div className="text-brand-gray">Loading similar products...</div>
        </div>
      </section>
    )
  }

  if (products.length === 0) {
    return (
      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-6 text-center">Similar Products</h2>
        <div className="flex items-center justify-center py-12">
          <div className="text-brand-gray">No similar products found.</div>
        </div>
      </section>
    )
  }

  return (
    <section className="mt-16">
      <h2 className="text-2xl font-bold mb-6 text-center">Similar Products</h2>

      <div className="relative">
        {/* Navigation Buttons */}
        {products.length > itemsPerView && (
          <>
            <button
              onClick={prevSlide}
              disabled={currentIndex === 0}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5 text-brand-gray" />
            </button>

            <button
              onClick={nextSlide}
              disabled={currentIndex >= maxIndex}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5 text-brand-gray" />
            </button>
          </>
        )}

        {/* Carousel Container */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{
              transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`
            }}
          >
            {products.map((product) => {
              const scoreBadge = getScoreBadgeStyle(product.bifl_total_score || 0)

              return (
                <div
                  key={product.id}
                  className="flex-shrink-0 px-2 sm:px-3 md:px-4"
                  style={{ width: `${100 / itemsPerView}%` }}
                >
                  <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-2xl shadow-sm border border-gray-100 text-center flex flex-col" style={{ minHeight: '350px' }}>
                    <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-brand-gray mb-4">{product.brand_name || 'Unknown Brand'}</p>

                    {/* Product Image */}
                    <div className="relative w-full h-32 sm:h-36 lg:h-40 bg-white rounded-lg mb-3 overflow-hidden flex-shrink-0 border border-gray-100">
                      {product.featured_image_url ? (
                        <Image
                          src={product.featured_image_url}
                          alt={product.name}
                          width={300}
                          height={160}
                          className="w-full h-full object-contain p-2"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-gray-500 text-sm">No Image</span>
                        </div>
                      )}
                      <BadgeDisplay
                        product={product}
                        size="xs"
                        overlay={true}
                      />
                      <FavoriteIcon productId={product.id} />
                    </div>

                    {/* BIFL Score */}
                    <div className="flex items-center justify-center space-x-2 mb-4 flex-shrink-0">
                      <span className="font-bold text-sm">BIFL Score:</span>
                      <div
                        className={scoreBadge.className}
                        data-score={scoreBadge.dataScore}
                      >
                        <span className="text-sm font-bold">
                          {(product.bifl_total_score || 0).toFixed(1)}
                        </span>
                      </div>
                    </div>

                    {/* Spacer to push button to bottom */}
                    <div className="flex-grow"></div>

                    {/* View Product Button */}
                    <Link
                      href={`/products/${product.id}`}
                      className="block w-full bg-brand-teal text-white font-bold py-3 px-4 rounded-lg text-center hover:bg-opacity-90 transition-opacity"
                      style={{ backgroundColor: '#4A9D93', minHeight: '48px' }}
                    >
                      View Product
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Indicators */}
        {products.length > itemsPerView && (
          <div className="flex justify-center space-x-2 mt-6">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-brand-teal' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}