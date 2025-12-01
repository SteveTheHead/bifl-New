'use client'

import { useState, useEffect } from 'react'
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
  MessageSquare,
  LayoutGrid,
  LogOut,
  Users,
  Mail
} from 'lucide-react'

interface AdminSession {
  id: string
  email: string
  name: string
  role: string
  loginTime: number
}

interface AdminDashboardClientProps {
  session: AdminSession
}

export default function AdminDashboardClient({ session }: AdminDashboardClientProps) {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalBrands: 0,
    totalReviews: 0,
    avgBiflScore: 0,
    newProductsThisWeek: 0
  })
  const [recentProducts, setRecentProducts] = useState<any[]>([])

  useEffect(() => {
    // Fetch dashboard stats and recent products
    fetchDashboardStats()
    fetchRecentProducts()
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

  const fetchRecentProducts = async () => {
    try {
      const response = await fetch('/api/admin/products')
      const data = await response.json()
      // Get the 5 most recent products
      setRecentProducts((data.products || []).slice(0, 5))
    } catch (error) {
      console.error('Failed to fetch recent products:', error)
    }
  }

  const handleSignOut = async () => {
    try {
      const response = await fetch('/api/admin/signout', {
        method: 'POST'
      })

      if (response.ok) {
        // Redirect to admin signin page
        window.location.href = '/admin/signin'
      } else {
        console.error('Sign out failed')
      }
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0 0 0) 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }}></div>

      {/* Header - Clean Minimal */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-gray-900 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">B</span>
                </div>
                <h1 className="text-lg font-semibold text-gray-900">Admin Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 font-medium hover:bg-gray-50 rounded-lg transition-colors"
              >
                View Site
              </Link>
              <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                <div className="text-sm text-gray-600">
                  {session?.name || session?.email}
                </div>
                <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-xs">
                    {(session?.name || session?.email || 'A').charAt(0).toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-0">
        {/* Stats Grid - Minimal */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
              <div className="p-2 bg-gray-100 rounded-lg">
                <Package className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Categories</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCategories}</p>
              </div>
              <div className="p-2 bg-gray-100 rounded-lg">
                <Tag className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Brands</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBrands}</p>
              </div>
              <div className="p-2 bg-gray-100 rounded-lg">
                <Building2 className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Reviews</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalReviews}</p>
              </div>
              <div className="p-2 bg-gray-100 rounded-lg">
                <Star className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">BIFL Score</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgBiflScore.toFixed(1)}</p>
              </div>
              <div className="p-2 bg-gray-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">This Week</p>
                <p className="text-2xl font-bold text-gray-900">{stats.newProductsThisWeek}</p>
              </div>
              <div className="p-2 bg-gray-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid - Minimal Bento */}
        <div className="mb-8">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* Add Product */}
            <Link
              href="/admin/products/new"
              className="bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-900 hover:shadow-sm transition-all group"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 bg-gray-900 rounded-lg group-hover:bg-gray-800 transition-colors">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Add Product</p>
                  <p className="text-xs text-gray-500 mt-0.5">Create new</p>
                </div>
              </div>
            </Link>

            {/* Curations */}
            <Link
              href="/admin/curations"
              className="bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-900 hover:shadow-sm transition-all group"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 bg-gray-100 rounded-lg group-hover:bg-gray-900 transition-colors">
                  <LayoutGrid className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Curations</p>
                  <p className="text-xs text-gray-500 mt-0.5">Collections</p>
                </div>
              </div>
            </Link>

            {/* Categories */}
            <Link
              href="/admin/categories"
              className="bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-900 hover:shadow-sm transition-all group"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 bg-gray-100 rounded-lg group-hover:bg-gray-900 transition-colors">
                  <Tag className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Categories</p>
                  <p className="text-xs text-gray-500 mt-0.5">Organize</p>
                </div>
              </div>
            </Link>

            {/* Brands */}
            <Link
              href="/admin/brands"
              className="bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-900 hover:shadow-sm transition-all group"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 bg-gray-100 rounded-lg group-hover:bg-gray-900 transition-colors">
                  <Building2 className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Brands</p>
                  <p className="text-xs text-gray-500 mt-0.5">Manage</p>
                </div>
              </div>
            </Link>

            {/* Reviews */}
            <Link
              href="/admin/reviews"
              className="bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-900 hover:shadow-sm transition-all group"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 bg-gray-100 rounded-lg group-hover:bg-gray-900 transition-colors">
                  <Star className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Reviews</p>
                  <p className="text-xs text-gray-500 mt-0.5">Moderate</p>
                </div>
              </div>
            </Link>

            {/* AI Content */}
            <Link
              href="/admin/ai-content"
              className="bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-900 hover:shadow-sm transition-all group"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 bg-gray-100 rounded-lg group-hover:bg-gray-900 transition-colors">
                  <Brain className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">AI Content</p>
                  <p className="text-xs text-gray-500 mt-0.5">Generate</p>
                </div>
              </div>
            </Link>

            {/* Feedback */}
            <Link
              href="/admin/feedback"
              className="bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-900 hover:shadow-sm transition-all group"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 bg-gray-100 rounded-lg group-hover:bg-gray-900 transition-colors">
                  <MessageSquare className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Feedback</p>
                  <p className="text-xs text-gray-500 mt-0.5">User input</p>
                </div>
              </div>
            </Link>

            {/* Users */}
            <Link
              href="/admin/users"
              className="bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-900 hover:shadow-sm transition-all group"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 bg-gray-100 rounded-lg group-hover:bg-gray-900 transition-colors">
                  <Users className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Users</p>
                  <p className="text-xs text-gray-500 mt-0.5">Manage</p>
                </div>
              </div>
            </Link>

            {/* Subscribers */}
            <Link
              href="/admin/subscribers"
              className="bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-900 hover:shadow-sm transition-all group"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 bg-gray-100 rounded-lg group-hover:bg-gray-900 transition-colors">
                  <Mail className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Subscribers</p>
                  <p className="text-xs text-gray-500 mt-0.5">Newsletter</p>
                </div>
              </div>
            </Link>

            {/* All Products */}
            <Link
              href="/admin/products"
              className="bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-900 hover:shadow-sm transition-all group"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 bg-gray-100 rounded-lg group-hover:bg-gray-900 transition-colors">
                  <Package className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">All Products</p>
                  <p className="text-xs text-gray-500 mt-0.5">View all</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Main Content Sections - Minimal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Recent Products */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900">Recent Products</h2>
                <Link
                  href="/admin/products"
                  className="text-xs text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  View All →
                </Link>
              </div>
            </div>
            <div className="p-5">
              {recentProducts.length > 0 ? (
                <div className="space-y-3">
                  {recentProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/admin/products/${product.id}/edit`}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        {product.featured_image_url ? (
                          <img src={product.featured_image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.brand_name}</p>
                      </div>
                      {product.bifl_total_score && (
                        <div className="flex items-center space-x-1 text-xs font-medium text-gray-600">
                          <Star className="w-3 h-3" />
                          <span>{product.bifl_total_score.toFixed(1)}</span>
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-lg flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 mb-3">No recent products</p>
                  <Link
                    href="/admin/products/new"
                    className="inline-flex items-center px-3 py-1.5 text-xs text-white font-medium bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add product
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Pending Reviews */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900">Pending Reviews</h2>
                <Link
                  href="/admin/reviews"
                  className="text-xs text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  View All →
                </Link>
              </div>
            </div>
            <div className="p-5">
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600">No pending reviews</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
