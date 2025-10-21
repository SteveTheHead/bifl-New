'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Package,
  Tag,
  Building2,
  Star,
  BarChart3,
  Plus,
  TrendingUp,
  ShoppingBag,
  Brain,
  MessageSquare
} from 'lucide-react'

export default function AdminDashboard() {
  const router = useRouter()
  const [session, setSession] = useState<{name?: string; email?: string; isAdmin?: boolean} | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalBrands: 0,
    totalReviews: 0,
    avgBiflScore: 0,
    newProductsThisWeek: 0
  })

  const checkSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/simple-session')
      const data = await response.json()


      if (data.isAuthenticated && data.user?.isAdmin) {
        setSession(data.user)
        setLoading(false)
      } else {
        router.push('/auth/signin')
      }
    } catch (error) {
      console.error('Session check error:', error)
      router.push('/auth/signin')
    }
  }, [router])

  useEffect(() => {
    checkSession()
  }, [checkSession])

  useEffect(() => {
    // Fetch dashboard stats
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-brand-teal to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">B</span>
                </div>
                <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                View Site
              </Link>
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-600">
                  {session?.name || session?.email}
                </div>
                <div className="w-8 h-8 bg-gradient-to-br from-brand-teal to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-xs">
                    {(session?.name || session?.email || 'A').charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200/60 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Products</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{stats.totalProducts}</p>
              </div>
              <div className="p-2 bg-gradient-to-br from-brand-teal to-blue-600 rounded-lg">
                <Package className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200/60 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Categories</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{stats.totalCategories}</p>
              </div>
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <Tag className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200/60 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Brands</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{stats.totalBrands}</p>
              </div>
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                <Building2 className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200/60 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Reviews</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{stats.totalReviews}</p>
              </div>
              <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg">
                <Star className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200/60 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">BIFL Score</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{stats.avgBiflScore.toFixed(1)}</p>
              </div>
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200/60 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">This Week</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{stats.newProductsThisWeek}</p>
              </div>
              <div className="p-2 bg-gradient-to-br from-brand-teal to-cyan-600 rounded-lg">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <Link
            href="/admin/products/new"
            className="bg-white rounded-lg p-4 shadow-sm border border-gray-200/60 hover:shadow-md hover:border-brand-teal/30 transition-all group"
          >
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-2 bg-gradient-to-br from-brand-teal to-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                <Plus className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Add Product</p>
                <p className="text-xs text-gray-500">Create new</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/categories"
            className="bg-white rounded-lg p-4 shadow-sm border border-gray-200/60 hover:shadow-md hover:border-blue-500/30 transition-all group"
          >
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg group-hover:scale-110 transition-transform">
                <Tag className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Categories</p>
                <p className="text-xs text-gray-500">Manage all</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/brands"
            className="bg-white rounded-lg p-4 shadow-sm border border-gray-200/60 hover:shadow-md hover:border-purple-500/30 transition-all group"
          >
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg group-hover:scale-110 transition-transform">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Brands</p>
                <p className="text-xs text-gray-500">Manage all</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/reviews"
            className="bg-white rounded-lg p-4 shadow-sm border border-gray-200/60 hover:shadow-md hover:border-yellow-500/30 transition-all group"
          >
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg group-hover:scale-110 transition-transform">
                <Star className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Reviews</p>
                <p className="text-xs text-gray-500">Moderate</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/feedback"
            className="bg-white rounded-lg p-4 shadow-sm border border-gray-200/60 hover:shadow-md hover:border-emerald-500/30 transition-all group"
          >
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg group-hover:scale-110 transition-transform">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Feedback</p>
                <p className="text-xs text-gray-500">Manage all</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/ai-content"
            className="bg-white rounded-lg p-4 shadow-sm border border-gray-200/60 hover:shadow-md hover:border-indigo-500/30 transition-all group"
          >
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg group-hover:scale-110 transition-transform">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">AI Content</p>
                <p className="text-xs text-gray-500">Generate</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Main Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Recent Products */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200/60">
            <div className="px-4 py-3 border-b border-gray-200/60">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900">Recent Products</h2>
                <Link
                  href="/admin/products"
                  className="text-xs text-brand-teal hover:text-brand-teal/80 font-medium"
                >
                  View All →
                </Link>
              </div>
            </div>
            <div className="p-4">
              <div className="text-center py-6 text-gray-500">
                <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm mb-2">No recent products</p>
                <Link
                  href="/admin/products/new"
                  className="text-xs text-brand-teal hover:text-brand-teal/80 font-medium"
                >
                  Add your first product
                </Link>
              </div>
            </div>
          </div>

          {/* Pending Reviews */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200/60">
            <div className="px-4 py-3 border-b border-gray-200/60">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900">Pending Reviews</h2>
                <Link
                  href="/admin/reviews"
                  className="text-xs text-brand-teal hover:text-brand-teal/80 font-medium"
                >
                  View All →
                </Link>
              </div>
            </div>
            <div className="p-4">
              <div className="text-center py-6 text-gray-500">
                <Star className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No pending reviews</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}