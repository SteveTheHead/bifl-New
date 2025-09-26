'use client'

import { useSession } from '@/components/auth/auth-client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, Star, Trash2, ShoppingBag } from 'lucide-react'
import { useFavorites } from '@/lib/hooks/use-favorites'
import { createClient } from '@/lib/supabase/client'

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
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const { favorites, loading: favoritesLoading, removeFromFavorites } = useFavorites()
  const [products, setProducts] = useState<FavoriteProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/auth/signin')
    }
  }, [session, isPending, router])

  useEffect(() => {
    if (!favoritesLoading && favorites.length > 0) {
      fetchFavoriteProducts()
    } else if (!favoritesLoading) {
      setLoading(false)
    }
  }, [favorites, favoritesLoading])

  const fetchFavoriteProducts = async () => {
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
  }

  const handleRemoveFavorite = async (productId: string) => {
    await removeFromFavorites(productId)
    setProducts(products.filter(p => p.id !== productId))
  }

  const getScoreBadgeStyle = (score: number | null) => {
    if (!score) return { className: "text-gray-700 bg-gray-200", label: "N/A" }

    if (score >= 9.0) {
      return {
        className: "text-white border border-green-200",
        style: { background: "linear-gradient(135deg, #4CAF50 0%, #66BB6A 50%, #81C784 100%)" },
        label: "Legend"
      }
    } else if (score >= 8.0) {
      return {
        className: "text-white border border-yellow-200",
        style: { background: "linear-gradient(135deg, #FFC107 0%, #FFD54F 50%, #FFE082 100%)" },
        label: "Excellent"
      }
    } else if (score >= 7.0) {
      return {
        className: "text-white border border-orange-200",
        style: { background: "linear-gradient(135deg, #FF9800 0%, #FFB74D 50%, #FFCC02 100%)" },
        label: "Good"
      }
    } else if (score >= 6.0) {
      return {
        className: "text-white border border-red-200",
        style: { background: "linear-gradient(135deg, #F44336 0%, #EF5350 50%, #E57373 100%)" },
        label: "Fair"
      }
    } else {
      return {
        className: "text-gray-700 border border-gray-200",
        style: { background: "linear-gradient(135deg, #9E9E9E 0%, #BDBDBD 50%, #E0E0E0 100%)" },
        label: "Poor"
      }
    }
  }

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="w-8 h-8 animate-spin rounded-full border-2 border-brand-teal border-t-transparent"></div>
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
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
                className="inline-flex items-center px-6 py-3 bg-brand-teal text-white font-medium rounded-lg hover:bg-opacity-90 transition-opacity"
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
                  <div className="relative aspect-video bg-gray-200">
                    {product.featured_image_url ? (
                      <Image
                        src={product.featured_image_url}
                        alt={product.name}
                        fill
                        className="object-cover"
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
                          className={`px-3 py-1 rounded-full text-sm font-bold ${scoreBadge.className}`}
                          style={scoreBadge.style}
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
                    <div className="flex space-x-3">
                      <Link
                        href={`/products/${product.id}`}
                        className="flex-1 bg-brand-teal text-white text-center py-3 px-4 rounded-lg font-medium hover:bg-opacity-90 transition-opacity"
                      >
                        View Product
                      </Link>
                      <button
                        onClick={() => handleRemoveFavorite(product.id)}
                        className="px-4 py-3 border border-gray-300 rounded-lg text-brand-gray hover:bg-gray-50 transition-colors"
                        title="Remove from favorites"
                      >
                        <Heart className="w-5 h-5 fill-current text-red-500" />
                      </button>
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
                className="inline-flex items-center px-6 py-3 bg-brand-teal text-white font-medium rounded-lg hover:bg-opacity-90 transition-opacity"
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