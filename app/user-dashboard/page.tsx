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
import { MiniProductCard } from '@/components/products/MiniProductCard'
import { RecentlyViewedCard } from '@/components/user/RecentlyViewedCard'
import { MiniRecentlyViewedCard } from '@/components/user/MiniRecentlyViewedCard'
import { AnimatedCounter } from '@/components/user/AnimatedCounter'
import { Avatar } from '@/components/user/avatar-upload'

interface DashboardStats {
  favoritesCount: number
  recentlyViewedCount: number
  joinDate: string
}

interface Product {
  id: string
  name: string
  slug: string
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
  const [isPersonalized, setIsPersonalized] = useState(false)
  const [loading, setLoading] = useState(true)

  // Check authentication with Supabase
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/user/auth')
        const data = await response.json()

        if (data.user) {
          setSession({ user: data.user })
        } else {
          redirect('/auth/signin')
        }
      } catch (error) {
        redirect('/auth/signin')
      } finally {
        setIsPending(false)
      }
    }

    checkAuth()
  }, [])

  // Redirect if not authenticated
  useEffect(() => {
    if (!isPending && !session?.user) {
      redirect('/auth/signin')
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

          // Fetch recommended products (now personalized!)
          const recommendedResponse = await fetch('/api/products/recommended')
          if (recommendedResponse.ok) {
            const data = await recommendedResponse.json()
            setRecommendedProducts(data.products?.slice(0, 6) || [])
            setIsPersonalized(data.personalized || false)
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
      <div className="bg-white shadow-md border-b-2 border-brand-teal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar
                  src={session.user.user_metadata?.avatar_url}
                  name={session.user.user_metadata?.name || session.user.email}
                  size="lg"
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-brand-teal rounded-full border-2 border-white shadow-md flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-brand-dark">
                  My Dashboard
                </h1>
                <p className="text-brand-gray mt-1 text-sm">
                  Welcome back, {session.user.user_metadata?.name || session.user.email}
                </p>
              </div>
            </div>
            <Link
              href="/products"
              className="text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 font-semibold shadow-md text-sm"
              style={{ backgroundColor: '#4A9D93' }}
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-4 border border-gray-100">
            <div className="flex items-center">
              <div className="bg-red-50 p-3 rounded-lg group-hover:bg-red-100 transition-colors duration-200">
                <Heart className="w-5 h-5 text-red-500" />
              </div>
              <div className="ml-4">
                <p className="text-xs font-medium text-brand-gray uppercase tracking-wide">Favorites</p>
                <p className="text-2xl font-bold text-brand-dark mt-0.5">
                  <AnimatedCounter end={stats.favoritesCount} />
                </p>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-4 border border-gray-100">
            <div className="flex items-center">
              <div className="bg-green-50 p-3 rounded-lg group-hover:bg-green-100 transition-colors duration-200">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-xs font-medium text-brand-gray uppercase tracking-wide">Member Since</p>
                <p className="text-lg font-bold text-brand-dark mt-0.5">
                  {new Date(stats.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-100">
          <h2 className="text-lg font-bold text-brand-dark mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <Link
              href="/products?sort=newest"
              className="group flex items-center p-4 bg-green-50 border border-green-200 rounded-lg hover:shadow-md hover:bg-green-100 transition-all duration-200"
            >
              <div className="bg-green-600 p-2 rounded-lg mr-3">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-brand-dark text-sm">New Products</p>
                <p className="text-xs text-brand-gray">See latest additions</p>
              </div>
              <ArrowRight className="w-4 h-4 text-brand-gray group-hover:text-green-600 group-hover:translate-x-1 transition-all duration-200" />
            </Link>

            <Link
              href="/user-dashboard/settings"
              className="group flex items-center p-4 bg-gray-50 border border-gray-200 rounded-lg hover:shadow-md hover:bg-gray-100 transition-all duration-200"
            >
              <div className="bg-gray-600 p-2 rounded-lg mr-3">
                <Settings className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-brand-dark text-sm">Account Settings</p>
                <p className="text-xs text-brand-gray">Manage preferences</p>
              </div>
              <ArrowRight className="w-4 h-4 text-brand-gray group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-200" />
            </Link>
          </div>
        </div>

        {/* Favorites Section */}
        {favoriteProducts.length > 0 && (
          <div className="bg-red-50/30 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-brand-dark">My Favorites</h2>
              <Link
                href="/favorites"
                className="text-gray-700 hover:text-gray-900 transition-colors duration-200 font-medium text-sm flex items-center gap-2"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {favoriteProducts.slice(0, 8).map((product) => (
                <MiniProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* Recently Viewed Section */}
        {recentlyViewed.length > 0 && (
          <div className="bg-brand-teal/5 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-brand-dark">Recently Viewed</h2>
                <p className="text-brand-gray mt-1 text-sm">
                  Products you've viewed recently with timestamps
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentlyViewed.slice(0, 8).map((product) => (
                <MiniRecentlyViewedCard key={product.id} product={product as any} />
              ))}
            </div>
          </div>
        )}

        {/* Recommendations Section */}
        {recommendedProducts.length > 0 && (
          <div className="bg-green-50/40 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-brand-dark">
                  {isPersonalized ? 'Recommended for You' : 'Top Rated Products'}
                </h2>
                {isPersonalized && (
                  <p className="text-brand-gray mt-1 text-sm">
                    Based on your favorites and preferences
                  </p>
                )}
              </div>
              <Link
                href="/products"
                className="text-gray-700 hover:text-gray-900 transition-colors duration-200 font-medium text-sm flex items-center gap-2"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendedProducts.slice(0, 8).map((product) => (
                <MiniProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {favoriteProducts.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
            <div className="bg-red-100 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Heart className="w-12 h-12 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-brand-dark mb-4">No Favorites Yet</h3>
            <p className="text-brand-gray mb-8 max-w-md mx-auto text-lg">
              Start building your collection of Buy It For Life products by adding your favorites.
            </p>
            <Link
              href="/products"
              className="text-gray-700 hover:text-gray-900 transition-colors duration-200 font-semibold inline-flex items-center gap-3 text-lg"
            >
              <Search className="w-5 h-5" />
              Explore Products
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}