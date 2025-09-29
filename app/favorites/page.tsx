'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react'
import { useFavorites } from '@/lib/hooks/use-favorites'
import { createClient } from '@/utils/supabase/client'

interface FavoriteProduct {
  id: string
  name: string
  slug: string
  brand_name: string
  featured_image_url: string | null
  bifl_total_score: number | null
  price: number | null
  excerpt: string | null
}

export default function FavoritesPage() {
  const router = useRouter()
  const { favorites, loading: favoritesLoading, removeFromFavorites } = useFavorites()
  const [products, setProducts] = useState<FavoriteProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  // Check authentication using our Supabase auth system
  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetch('/api/user/auth')
        const data = await response.json()
        setUser(data.user)

        if (!data.user) {
          router.push('/auth/signin')
        }
      } catch (error) {
        console.error('Error checking auth:', error)
        setUser(null)
        router.push('/auth/signin')
      } finally {
        setAuthLoading(false)
      }
    }
    checkUser()
  }, [router])

  const fetchFavoriteProducts = useCallback(async () => {
    if (favorites.length === 0) {
      setProducts([])
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('products_with_taxonomy')
        .select('id, name, slug, brand_name, featured_image_url, bifl_total_score, price, excerpt')
        .in('id', favorites)
        .eq('status', 'published')

      if (error) {
        console.error('Error fetching favorite products:', error)
        return
      }

      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching favorite products:', error)
    } finally {
      setLoading(false)
    }
  }, [favorites])

  useEffect(() => {
    if (!favoritesLoading && favorites.length > 0) {
      fetchFavoriteProducts()
    } else if (!favoritesLoading) {
      setLoading(false)
    }
  }, [favorites, favoritesLoading, fetchFavoriteProducts])

  const handleRemoveFavorite = async (productId: string) => {
    await removeFromFavorites(productId)
    setProducts(products.filter(p => p.id !== productId))
  }

  function getScoreBadgeStyle(score: number | null) {
    if (!score) return {
      className: "score-field px-3 py-1 rounded-full transform transition-all duration-300",
      dataScore: "0"
    }

    const scoreString = score.toString()
    return {
      className: "score-field px-3 py-1 rounded-full transform transition-all duration-300",
      dataScore: scoreString
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="w-8 h-8 animate-spin rounded-full border-2 border-brand-teal border-t-transparent"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link
            href="/user-dashboard"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-brand-dark mb-2">My Favorites</h1>
          <p className="text-brand-gray">
            {products.length > 0
              ? `${products.length} product${products.length !== 1 ? 's' : ''} saved for later`
              : 'Products you\'ve saved for later'
            }
          </p>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="text-center py-12">
              <Heart className="w-16 h-16 text-brand-gray mx-auto mb-4" />
              <h2 className="text-xl font-bold text-brand-dark mb-2">No favorites yet</h2>
              <p className="text-brand-gray mb-6">
                Start exploring products and save your favorites to see them here.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center px-6 py-3 text-white font-medium rounded-lg hover:bg-opacity-90 transition-opacity"
                style={{ backgroundColor: '#4A9D93' }}
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Browse Products
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const scoreBadge = getScoreBadgeStyle(product.bifl_total_score)

              return (
                <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow">
                  {/* Product Image */}
                  <div className="relative bg-gray-50 p-4" style={{ height: '224px' }}>
                    {product.featured_image_url ? (
                      <Image
                        src={product.featured_image_url}
                        alt={product.name}
                        fill
                        className="object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-500">No Image</span>
                      </div>
                    )}

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveFavorite(product.id)}
                      className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors group-hover:scale-110"
                      title="Remove from favorites"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="p-6">
                    <div className="mb-3">
                      <p className="text-sm text-brand-gray mb-1">{product.brand_name || 'Unknown Brand'}</p>
                      <h3 className="font-bold text-lg text-brand-dark line-clamp-2 mb-2">
                        {product.name}
                      </h3>
                      {product.excerpt && (
                        <p className="text-sm text-brand-gray line-clamp-2 mb-3">
                          {product.excerpt}
                        </p>
                      )}
                    </div>

                    {/* BIFL Score */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-brand-dark">BIFL Score:</span>
                        <div
                          className={`${scoreBadge.className} text-sm font-bold`}
                          data-score={scoreBadge.dataScore}
                        >
                          {product.bifl_total_score ? product.bifl_total_score.toFixed(1) : 'N/A'}
                        </div>
                      </div>

                      {product.price && (
                        <div className="text-lg font-bold text-brand-dark">
                          ${product.price}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div>
                      <Link
                        href={`/products/${product.id}`}
                        className="w-full block text-white text-center py-3 px-4 rounded-lg font-medium hover:bg-opacity-90 transition-opacity"
                        style={{ backgroundColor: '#4A9D93' }}
                      >
                        View Product
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Quick Actions */}
        {products.length > 0 && (
          <div className="mt-12 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-brand-dark mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/products"
                className="inline-flex items-center px-6 py-3 text-white font-medium rounded-lg hover:bg-opacity-90 transition-opacity"
                style={{ backgroundColor: '#4A9D93' }}
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Browse More Products
              </Link>
              <button
                onClick={() => {
                  const productLinks = products.map(p => `${window.location.origin}/products/${p.id}`).join('\n')
                  navigator.clipboard.writeText(productLinks)
                }}
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-brand-gray font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Share Favorites
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}