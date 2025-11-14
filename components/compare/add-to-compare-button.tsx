'use client'

import { useState, useEffect } from 'react'
import { Plus, Check } from 'lucide-react'
import { useCompare } from '@/contexts/compare-context'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  images: string[]
  average_score?: number
  affiliate_link?: string
}

interface AddToCompareButtonProps {
  product: Product
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary'
}

export function AddToCompareButton({
  product,
  size = 'md',
  variant = 'secondary'
}: AddToCompareButtonProps) {
  const { addToCompare, removeFromCompare, isInCompare, canAddMore } = useCompare()
  const [isHovered, setIsHovered] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const inCompare = isMounted ? isInCompare(product.id) : false
  const disabled = !canAddMore && !inCompare

  const handleClick = () => {
    if (inCompare) {
      removeFromCompare(product.id)
    } else {
      addToCompare(product)
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs'
      case 'lg':
        return 'px-6 py-3 text-base'
      default:
        return 'px-4 py-2 text-sm'
    }
  }

  const getVariantClasses = () => {
    if (inCompare) {
      // Ensure good contrast - dark background with white text
      return 'bg-gray-800 text-white border-gray-800 hover:bg-red-600 hover:border-red-600'
    }

    if (disabled) {
      return 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
    }

    switch (variant) {
      case 'primary':
        return 'bg-brand-dark text-white border-brand-dark hover:bg-brand-darker'
      default:
        return 'bg-white text-brand-dark border-brand-dark hover:bg-brand-50'
    }
  }

  const getButtonText = () => {
    if (inCompare) {
      return isHovered ? 'Remove' : 'Added'
    }

    if (disabled) {
      return 'Compare Full'
    }

    return 'Add to Compare'
  }

  const getIcon = () => {
    if (inCompare) {
      return <Check className="w-4 h-4" />
    }
    return <Plus className="w-4 h-4" />
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        inline-flex items-center justify-center gap-2
        border-2 rounded-lg font-medium transition-all duration-200
        ${getSizeClasses()}
        ${getVariantClasses()}
        ${disabled ? '' : 'hover:scale-105'}
      `}
    >
      {getIcon()}
      <span>{getButtonText()}</span>
    </button>
  )
}