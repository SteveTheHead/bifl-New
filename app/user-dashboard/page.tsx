'use client'

// Using simple session check instead of better-auth
import { useFavorites } from '@/lib/hooks/use-favorites'
import { useRecentlyViewed } from '@/lib/hooks/use-recently-viewed'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  Heart,
  Eye,
  Settings,
  Search,
  ArrowRight,
  Calendar,
  TrendingUp
} from 'lucide-react'
import { SimpleProductCard } from '@/components/products/SimpleProductCard'
import { Avatar } from '@/components/user/avatar-upload'

interface DashboardStats {
  favoritesCount: number
  recentlyViewedCount: number
  joinDate: string
}

interface Product {
  id: string
  name: string
  price: string
  featured_image_url?: string
  bifl_total_score?: number
  brand_name?: string
  created_at?: string
}

export default function UserDashboardPage() {
  const [session, setSession] = useState<any>(null)
  const [isPending, setIsPending] = useState(true)
  const { favorites, loading: favoritesLoading } = useFavorites()
  const { recentlyViewed, loading: recentlyViewedLoading } = useRecentlyViewed()
  const [stats, setStats] = useState<DashboardStats>({
    favoritesCount: 0,
    recentlyViewedCount: 0,
    joinDate: new Date().toISOString()
  })
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([])
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // Check authentication with our simple auth system
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/user/auth')
        const data = await response.json()

        if (data.user) {
          setSession({ user: data.user })
        } else {
          redirect('/login')
        }
      } catch (error) {
        redirect('/login')
      } finally {
        setIsPending(false)
      }
    }

    checkAuth()
  }, [])

  // Redirect if not authenticated
  useEffect(() => {
    if (!isPending && !session?.user) {
      redirect('/login')
    }
  }, [session, isPending])

  // Fetch user data and stats
  useEffect(() => {
    if (session?.user && !favoritesLoading && !recentlyViewedLoading) {
      const fetchUserData = async () => {
        try {
          setLoading(true)

          // Update stats
          setStats({
            favoritesCount: favorites.length,
            recentlyViewedCount: recentlyViewed.length,
            joinDate: new Date().toISOString() // Will get from user profile later
          })

          // Fetch favorite products
          if (favorites.length > 0) {
            const favoriteProductsResponse = await fetch('/api/user/favorites', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ productIds: favorites })
            })

            if (favoriteProductsResponse.ok) {
              const data = await favoriteProductsResponse.json()
              setFavoriteProducts(data.products || [])
            }
          } else {
            setFavoriteProducts([])
          }

          // Fetch recommended products (top rated for now)
          const recommendedResponse = await fetch('/api/products/recommended')
          if (recommendedResponse.ok) {
            const data = await recommendedResponse.json()
            setRecommendedProducts(data.products?.slice(0, 6) || [])
          }

        } catch (error) {
          console.error('Error fetching user data:', error)
        } finally {
          setLoading(false)
        }
      }

      fetchUserData()
    }
  }, [session?.user, favoritesLoading, recentlyViewedLoading, favorites.length, recentlyViewed.length])

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin rounded-full border-2 border-brand-teal border-t-transparent mx-auto mb-4"></div>
          <p className="text-brand-gray">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar
                src={session.user.user_metadata?.avatar_url}
                name={session.user.user_metadata?.name || session.user.email}
                size="xl"
              />
              <div>
                <h1 className="text-3xl font-bold text-brand-dark">My Dashboard</h1>
                <p className="text-brand-gray mt-1">
                  Welcome back, {session.user.user_metadata?.name || session.user.email}
                </p>
              </div>
            </div>
            <Link
              href="/products"
              className="bg-brand-teal text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity font-medium flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Browse Products
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-lg">
                <Heart className="w-6 h-6 text-red-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-brand-gray">Favorites</p>
                <p className="text-2xl font-bold text-brand-dark">{stats.favoritesCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Eye className="w-6 h-6 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-brand-gray">Recently Viewed</p>
                <p className="text-2xl font-bold text-brand-dark">{stats.recentlyViewedCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-brand-gray">Member Since</p>
                <p className="text-2xl font-bold text-brand-dark">
                  {new Date(stats.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-brand-dark mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/products"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-brand-teal hover:bg-brand-teal/5 transition-colors"
            >
              <Search className="w-5 h-5 text-brand-teal mr-3" />
              <div>
                <p className="font-medium text-brand-dark">Browse Products</p>
                <p className="text-sm text-brand-gray">Discover new BIFL items</p>
              </div>
              <ArrowRight className="w-4 h-4 text-brand-gray ml-auto" />
            </Link>

            <Link
              href="/products?sort=newest"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-brand-teal hover:bg-brand-teal/5 transition-colors"
            >
              <TrendingUp className="w-5 h-5 text-brand-teal mr-3" />
              <div>
                <p className="font-medium text-brand-dark">New Products</p>
                <p className="text-sm text-brand-gray">See latest additions</p>
              </div>
              <ArrowRight className="w-4 h-4 text-brand-gray ml-auto" />
            </Link>

            <Link
              href="/user-dashboard/settings"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-brand-teal hover:bg-brand-teal/5 transition-colors"
            >
              <Settings className="w-5 h-5 text-brand-teal mr-3" />
              <div className="text-left">
                <p className="font-medium text-brand-dark">Account Settings</p>
                <p className="text-sm text-brand-gray">Manage preferences</p>
              </div>
              <ArrowRight className="w-4 h-4 text-brand-gray ml-auto" />
            </Link>
          </div>
        </div>

        {/* Favorites Section */}
        {favoriteProducts.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-brand-dark">My Favorites</h2>
              <Link
                href="/user-dashboard/favorites"
                className="text-brand-teal hover:text-brand-dark font-medium text-sm flex items-center gap-1"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteProducts.slice(0, 6).map((product) => (
                <SimpleProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* Recently Viewed Section */}
        {recentlyViewed.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-brand-dark">Recently Viewed</h2>
              <Link
                href="/user-dashboard/recently-viewed"
                className="text-brand-teal hover:text-brand-dark font-medium text-sm flex items-center gap-1"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentlyViewed.slice(0, 6).map((product) => (
                <SimpleProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* Recommendations Section */}
        {recommendedProducts.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-brand-dark">Recommended for You</h2>
              <Link
                href="/products?sort=score-desc"
                className="text-brand-teal hover:text-brand-dark font-medium text-sm flex items-center gap-1"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedProducts.map((product) => (
                <SimpleProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {favoriteProducts.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-brand-dark mb-2">No Favorites Yet</h3>
            <p className="text-brand-gray mb-6 max-w-md mx-auto">
              Start building your collection of Buy It For Life products by adding your favorites.
            </p>
            <Link
              href="/products"
              className="bg-brand-teal text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-medium inline-flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Explore Products
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}