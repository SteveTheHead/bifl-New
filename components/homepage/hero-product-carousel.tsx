'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// Score badge styling function
function getScoreBadgeStyle(score: number) {
  const scoreString = score.toString()
  return {
    className: "score-field px-2 py-0.5 rounded-full transform transition-all duration-300",
    dataScore: scoreString
  }
}

function getScoreLabel(score: number) {
  if (score >= 9.0) return "Legend"
  if (score >= 8.0) return "Excellent"
  if (score >= 7.0) return "Good"
  if (score >= 6.0) return "Fair"
  return "Poor"
}

interface Product {
  id: string
  name: string
  slug: string
  featured_image_url?: string
  bifl_total_score?: number
  brand_name?: string
  price?: number
  brands?: {
    name?: string
  }
}

interface HeroProductCarouselProps {
  products: Product[]
}

export function HeroProductCarousel({ products }: HeroProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isFading, setIsFading] = useState(false)

  // Auto-rotate every 6 seconds with fade effect
  useEffect(() => {
    if (!isHovered && products.length > 1) {
      const interval = setInterval(() => {
        setIsFading(true)
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % products.length)
          setIsFading(false)
        }, 400)
      }, 6000)
      return () => clearInterval(interval)
    }
  }, [isHovered, products.length])

  const goToPrevious = () => {
    setIsFading(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + products.length) % products.length)
      setIsFading(false)
    }, 400)
  }

  const goToNext = () => {
    setIsFading(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length)
      setIsFading(false)
    }, 400)
  }

  const goToSlide = (index: number) => {
    setIsFading(true)
    setTimeout(() => {
      setCurrentIndex(index)
      setIsFading(false)
    }, 400)
  }

  if (!products || products.length === 0) return null

  const currentProduct = products[currentIndex]
  const totalScore = currentProduct.bifl_total_score || 0
  const scoreBadge = getScoreBadgeStyle(totalScore)
  const brandName = currentProduct.brands?.name || currentProduct.brand_name || 'Unknown Brand'

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Card */}
      <Link href={`/products/${currentProduct.slug}`}>
        <div className={`group cursor-pointer transition-opacity duration-500 ease-in-out ${isFading ? 'opacity-0' : 'opacity-100'}`}>
          {/* Product Image */}
          <div className="relative bg-white rounded-xl overflow-hidden mb-3 h-48 flex items-center justify-center">
            {currentProduct.featured_image_url ? (
              <Image
                src={currentProduct.featured_image_url}
                alt={currentProduct.name}
                width={240}
                height={192}
                className="object-contain w-full h-full p-3 group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400 text-sm">No image</span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="text-center space-y-2">
            <h3 className="text-base font-bold text-brand-dark line-clamp-2 group-hover:text-brand-teal transition-colors duration-500 leading-tight px-2">
              {currentProduct.name}
            </h3>
            <p className="text-xs text-brand-gray">{brandName}</p>

            {/* BIFL Score */}
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-xs font-medium text-brand-gray">BIFL:</span>
              <div
                className={scoreBadge.className}
                data-score={scoreBadge.dataScore}
              >
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold">
                    {totalScore.toFixed(1)}
                  </span>
                  <span className="text-xs font-medium opacity-90">
                    {getScoreLabel(totalScore)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Navigation Arrows */}
      {products.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-300 hover:scale-110"
            aria-label="Previous product"
          >
            <ChevronLeft className="w-5 h-5 text-brand-dark" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-300 hover:scale-110"
            aria-label="Next product"
          >
            <ChevronRight className="w-5 h-5 text-brand-dark" />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {products.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-4">
          {products.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? 'w-6 h-1.5'
                  : 'w-1.5 h-1.5 hover:w-3'
              }`}
              style={{
                backgroundColor: index === currentIndex ? '#4A9D93' : '#d1d5db'
              }}
              aria-label={`Go to product ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
