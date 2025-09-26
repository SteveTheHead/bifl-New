'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { FavoriteIcon } from '../favorites/favorite-button'

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
        const supabase = createClient()

        // Get similar products based on category and exclude current product
        let query = supabase
          .from('products_with_taxonomy')
          .select('*')
          .eq('status', 'published')
          .neq('id', currentProductId) // Exclude current product

        // If we have a category, prioritize products from the same category
        if (categoryId) {
          query = query.eq('category_id', categoryId)
        }

        const { data, error } = await query
          .order('bifl_total_score', { ascending: false })
          .limit(8)

        if (error) {
          console.error('Error fetching similar products:', error)
          setProducts([])
          return
        }

        let similarProducts = data || []

        // If we don't have enough products from the same category, get more from any category
        if (similarProducts.length < 8 && similarProducts.length > 0) {
          const remainingLimit = 8 - similarProducts.length
          const excludeIds = [currentProductId, ...similarProducts.map(p => p.id)]

          const { data: additionalData, error: additionalError } = await supabase
            .from('products_with_taxonomy')
            .select('*')
            .eq('status', 'published')
            .not('id', 'in', `(${excludeIds.join(',')})`)
            .order('bifl_total_score', { ascending: false })
            .limit(remainingLimit)

          if (!additionalError && additionalData) {
            similarProducts = [...similarProducts, ...additionalData]
          }
        }

        setProducts(similarProducts)
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
                    <p className="text-xs sm:text-sm text-brand-gray mb-2">{product.brand_name || 'Unknown Brand'}</p>
                    <h3 className="font-serif text-sm sm:text-base lg:text-lg font-bold mb-3 line-clamp-2">
                      {product.name}
                    </h3>

                    {/* Product Image */}
                    <div className="relative w-full h-32 sm:h-36 lg:h-40 bg-gray-200 rounded-lg mb-3 overflow-hidden flex-shrink-0">
                      {product.featured_image_url ? (
                        <Image
                          src={product.featured_image_url}
                          alt={product.name}
                          width={300}
                          height={160}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-gray-500 text-sm">No Image</span>
                        </div>
                      )}
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