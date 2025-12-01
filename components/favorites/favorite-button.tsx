'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { useFavorites } from '@/lib/hooks/use-favorites'
import { trackAddToFavorites, trackRemoveFromFavorites } from '@/lib/analytics'

interface FavoriteButtonProps {
  productId: string
  productName?: string
  variant?: 'default' | 'large' | 'small'
  showText?: boolean
  className?: string
}

export function FavoriteButton({
  productId,
  productName = '',
  variant = 'default',
  showText = false,
  className = ''
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  // Check authentication using our Supabase auth system
  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetch('/api/user/auth')
        const data = await response.json()
        setUser(data.user)
      } catch (error) {
        console.error('Error checking auth:', error)
        setUser(null)
      }
    }
    checkUser()
  }, [])

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      // Redirect to sign in
      window.location.href = '/auth/signin'
      return
    }

    // Track before toggling so we know current state
    const wasAlreadyFavorite = isFavorite(productId)

    setIsLoading(true)
    await toggleFavorite(productId)
    setIsLoading(false)

    // Track the action after successful toggle
    if (wasAlreadyFavorite) {
      trackRemoveFromFavorites(productId, productName)
    } else {
      trackAddToFavorites(productId, productName)
    }
  }

  const isFav = isFavorite(productId)

  // Size variants
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-5 h-5',
    large: 'w-6 h-6'
  }

  const buttonSizeClasses = {
    small: 'p-1',
    default: 'p-2',
    large: 'p-3'
  }

  const textSizeClasses = {
    small: 'text-xs',
    default: 'text-sm',
    large: 'text-base'
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`
        inline-flex items-center space-x-2 rounded-lg transition-all duration-200
        ${isFav
          ? 'text-red-500 hover:text-red-600'
          : 'text-gray-400 hover:text-red-500'
        }
        ${buttonSizeClasses[variant]}
        disabled:opacity-50 disabled:cursor-not-allowed
        hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-200
        ${className}
      `}
      title={isFav ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isLoading ? (
        <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-red-500 ${sizeClasses[variant]}`} />
      ) : (
        <Heart
          className={`${sizeClasses[variant]} transition-all duration-200 ${
            isFav ? 'fill-current' : ''
          }`}
        />
      )}

      {showText && (
        <span className={`font-medium ${textSizeClasses[variant]}`}>
          {isFav ? 'Favorited' : 'Add to Favorites'}
        </span>
      )}
    </button>
  )
}

// Compact version for product cards
export function FavoriteIcon({ productId, className = '' }: { productId: string; className?: string }) {
  return (
    <FavoriteButton
      productId={productId}
      variant="small"
      className={`absolute top-2 right-2 bg-white/80 backdrop-blur-sm shadow-md hover:bg-white ${className}`}
    />
  )
}

// Full button with text for product pages
export function FavoriteButtonWithText({ productId, className = '' }: { productId: string; className?: string }) {
  return (
    <FavoriteButton
      productId={productId}
      variant="default"
      showText={true}
      className={`border border-gray-300 bg-white hover:bg-gray-50 ${className}`}
    />
  )
}