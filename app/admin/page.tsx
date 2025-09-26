'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Package,
  Tag,
  Building2,
  Star,
  Users,
  BarChart3,
  Settings,
  Plus,
  TrendingUp,
  ShoppingBag
} from 'lucide-react'

export default function AdminDashboard() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalBrands: 0,
    totalReviews: 0,
    avgBiflScore: 0,
    newProductsThisWeek: 0
  })

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/simple-session')
      const data = await response.json()

      console.log('Session check:', data)

      if (data.isAuthenticated && data.user?.isAdmin) {
        setSession(data.user)
        setLoading(false)
      } else {
        console.log('Not authenticated, redirecting to sign-in')
        router.push('/auth/signin')
      }
    } catch (error) {
      console.error('Session check error:', error)
      router.push('/auth/signin')
    }
  }

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
    <div className=\"min-h-screen bg-brand-cream\">
      {/* Header */}
      <header className=\"bg-white shadow-sm border-b border-gray-200\">
        <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">
          <div className=\"flex justify-between items-center h-16\">
            <div className=\"flex items-center\">
              <h1 className=\"text-2xl font-bold text-brand-dark\">BIFL Admin</h1>
            </div>
            <div className=\"flex items-center space-x-4\">
              <Link
                href=\"/\"
                className=\"text-brand-gray hover:text-brand-dark font-medium\"
              >
                View Site
              </Link>
              <div className=\"text-sm text-brand-gray\">
                Welcome, {session?.name || session?.email}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8\">
        {/* Stats Grid */}
        <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8\">
          <div className=\"bg-white rounded-xl p-6 shadow-sm border border-gray-100\">
            <div className=\"flex items-center\">
              <div className=\"p-3 bg-brand-teal/10 rounded-lg\">
                <Package className=\"w-6 h-6 text-brand-teal\" />
              </div>
              <div className=\"ml-4\">
                <p className=\"text-sm font-medium text-brand-gray\">Total Products</p>
                <p className=\"text-2xl font-bold text-brand-dark\">{stats.totalProducts}</p>
              </div>
            </div>
          </div>

          <div className=\"bg-white rounded-xl p-6 shadow-sm border border-gray-100\">
            <div className=\"flex items-center\">
              <div className=\"p-3 bg-blue-500/10 rounded-lg\">
                <Tag className=\"w-6 h-6 text-blue-500\" />
              </div>
              <div className=\"ml-4\">
                <p className=\"text-sm font-medium text-brand-gray\">Categories</p>
                <p className=\"text-2xl font-bold text-brand-dark\">{stats.totalCategories}</p>
              </div>
            </div>
          </div>

          <div className=\"bg-white rounded-xl p-6 shadow-sm border border-gray-100\">
            <div className=\"flex items-center\">
              <div className=\"p-3 bg-purple-500/10 rounded-lg\">
                <Building2 className=\"w-6 h-6 text-purple-500\" />
              </div>
              <div className=\"ml-4\">
                <p className=\"text-sm font-medium text-brand-gray\">Brands</p>
                <p className=\"text-2xl font-bold text-brand-dark\">{stats.totalBrands}</p>
              </div>
            </div>
          </div>

          <div className=\"bg-white rounded-xl p-6 shadow-sm border border-gray-100\">
            <div className=\"flex items-center\">
              <div className=\"p-3 bg-yellow-500/10 rounded-lg\">
                <Star className=\"w-6 h-6 text-yellow-500\" />
              </div>
              <div className=\"ml-4\">
                <p className=\"text-sm font-medium text-brand-gray\">Reviews</p>
                <p className=\"text-2xl font-bold text-brand-dark\">{stats.totalReviews}</p>
              </div>
            </div>
          </div>

          <div className=\"bg-white rounded-xl p-6 shadow-sm border border-gray-100\">
            <div className=\"flex items-center\">
              <div className=\"p-3 bg-green-500/10 rounded-lg\">
                <BarChart3 className=\"w-6 h-6 text-green-500\" />
              </div>
              <div className=\"ml-4\">
                <p className=\"text-sm font-medium text-brand-gray\">Avg BIFL Score</p>
                <p className=\"text-2xl font-bold text-brand-dark\">{stats.avgBiflScore.toFixed(1)}</p>
              </div>
            </div>
          </div>

          <div className=\"bg-white rounded-xl p-6 shadow-sm border border-gray-100\">
            <div className=\"flex items-center\">
              <div className=\"p-3 bg-brand-teal/10 rounded-lg\">
                <TrendingUp className=\"w-6 h-6 text-brand-teal\" />
              </div>
              <div className=\"ml-4\">
                <p className=\"text-sm font-medium text-brand-gray\">New This Week</p>
                <p className=\"text-2xl font-bold text-brand-dark\">{stats.newProductsThisWeek}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8\">
          <Link
            href=\"/admin/products/new\"
            className=\"bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group\"
          >
            <div className=\"flex items-center\">
              <div className=\"p-3 bg-brand-teal/10 rounded-lg group-hover:bg-brand-teal/20 transition-colors\">
                <Plus className=\"w-6 h-6 text-brand-teal\" />
              </div>
              <div className=\"ml-4\">
                <p className=\"font-semibold text-brand-dark\">Add Product</p>
                <p className=\"text-sm text-brand-gray\">Create new product</p>
              </div>
            </div>
          </Link>

          <Link
            href=\"/admin/categories\"
            className=\"bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group\"
          >
            <div className=\"flex items-center\">
              <div className=\"p-3 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors\">
                <Tag className=\"w-6 h-6 text-blue-500\" />
              </div>
              <div className=\"ml-4\">
                <p className=\"font-semibold text-brand-dark\">Manage Categories</p>
                <p className=\"text-sm text-brand-gray\">Edit categories</p>
              </div>
            </div>
          </Link>

          <Link
            href=\"/admin/brands\"
            className=\"bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group\"
          >
            <div className=\"flex items-center\">
              <div className=\"p-3 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors\">
                <Building2 className=\"w-6 h-6 text-purple-500\" />
              </div>
              <div className=\"ml-4\">
                <p className=\"font-semibold text-brand-dark\">Manage Brands</p>
                <p className=\"text-sm text-brand-gray\">Edit brands</p>
              </div>
            </div>
          </Link>

          <Link
            href=\"/admin/reviews\"
            className=\"bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group\"
          >
            <div className=\"flex items-center\">
              <div className=\"p-3 bg-yellow-500/10 rounded-lg group-hover:bg-yellow-500/20 transition-colors\">
                <Star className=\"w-6 h-6 text-yellow-500\" />
              </div>
              <div className=\"ml-4\">
                <p className=\"font-semibold text-brand-dark\">Review Queue</p>
                <p className=\"text-sm text-brand-gray\">Moderate reviews</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Main Content Sections */}
        <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-8\">
          {/* Recent Products */}
          <div className=\"bg-white rounded-xl shadow-sm border border-gray-100\">
            <div className=\"p-6 border-b border-gray-100\">
              <div className=\"flex items-center justify-between\">
                <h2 className=\"text-lg font-semibold text-brand-dark\">Recent Products</h2>
                <Link
                  href=\"/admin/products\"
                  className=\"text-sm text-brand-teal hover:text-brand-teal/80\"
                >
                  View All
                </Link>
              </div>
            </div>
            <div className=\"p-6\">
              <div className=\"space-y-4\">
                {/* Product items would be mapped here */}
                <div className=\"text-center py-8 text-brand-gray\">
                  <ShoppingBag className=\"w-12 h-12 mx-auto mb-4 opacity-50\" />
                  <p>No recent products</p>
                  <Link
                    href=\"/admin/products/new\"
                    className=\"text-brand-teal hover:text-brand-teal/80 font-medium\"
                  >
                    Add your first product
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Reviews */}
          <div className=\"bg-white rounded-xl shadow-sm border border-gray-100\">
            <div className=\"p-6 border-b border-gray-100\">
              <div className=\"flex items-center justify-between\">
                <h2 className=\"text-lg font-semibold text-brand-dark\">Pending Reviews</h2>
                <Link
                  href=\"/admin/reviews\"
                  className=\"text-sm text-brand-teal hover:text-brand-teal/80\"
                >
                  View All
                </Link>
              </div>
            </div>
            <div className=\"p-6\">
              <div className=\"space-y-4\">
                <div className=\"text-center py-8 text-brand-gray\">
                  <Star className=\"w-12 h-12 mx-auto mb-4 opacity-50\" />
                  <p>No pending reviews</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}