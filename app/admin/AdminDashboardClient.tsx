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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0 0 0) 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }}></div>

      {/* Background Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-teal/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"></div>

      {/* Header with Glassmorphism */}
      <header className="bg-white/70 backdrop-blur-xl shadow-sm border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-brand-teal via-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-teal/20">
                  <span className="text-white font-bold">B</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Admin Dashboard</h1>
                  <p className="text-xs text-gray-500">Welcome back</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 font-medium bg-white/60 hover:bg-white/80 backdrop-blur-sm rounded-lg transition-all border border-gray-200/50"
              >
                View Site
              </Link>
              <div className="flex items-center space-x-3 pl-4 border-l border-gray-200/50">
                <div className="text-sm text-gray-700 font-medium">
                  {session?.name || session?.email}
                </div>
                <div className="w-9 h-9 bg-gradient-to-br from-brand-teal to-blue-600 rounded-full flex items-center justify-center ring-2 ring-white/50">
                  <span className="text-white font-semibold text-sm">
                    {(session?.name || session?.email || 'A').charAt(0).toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50/80 rounded-lg transition-all backdrop-blur-sm"
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
        {/* Stats Grid with Glassmorphism */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-5 border border-white/40 shadow-xl shadow-brand-teal/5 hover:shadow-2xl hover:shadow-brand-teal/10 transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Products</p>
                <p className="text-2xl font-bold bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">{stats.totalProducts}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-brand-teal to-blue-600 rounded-xl shadow-lg shadow-brand-teal/30 group-hover:scale-110 transition-transform">
                <Package className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-5 border border-white/40 shadow-xl shadow-blue-500/5 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Categories</p>
                <p className="text-2xl font-bold bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">{stats.totalCategories}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                <Tag className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-5 border border-white/40 shadow-xl shadow-purple-500/5 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Brands</p>
                <p className="text-2xl font-bold bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">{stats.totalBrands}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                <Building2 className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-5 border border-white/40 shadow-xl shadow-yellow-500/5 hover:shadow-2xl hover:shadow-yellow-500/10 transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Reviews</p>
                <p className="text-2xl font-bold bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">{stats.totalReviews}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl shadow-lg shadow-yellow-500/30 group-hover:scale-110 transition-transform">
                <Star className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-5 border border-white/40 shadow-xl shadow-green-500/5 hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">BIFL Score</p>
                <p className="text-2xl font-bold bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">{stats.avgBiflScore.toFixed(1)}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-5 border border-white/40 shadow-xl shadow-cyan-500/5 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">This Week</p>
                <p className="text-2xl font-bold bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">{stats.newProductsThisWeek}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-brand-teal to-cyan-600 rounded-xl shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Bento Box Grid - Modern Asymmetric Layout */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 px-1">Quick Actions</h2>
          <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-4 auto-rows-[140px]">
            {/* Featured: Add Product - Larger card */}
            <Link
              href="/admin/products/new"
              className="col-span-2 row-span-2 bg-gradient-to-br from-brand-teal via-blue-500 to-purple-600 backdrop-blur-xl rounded-3xl p-6 shadow-2xl shadow-brand-teal/20 hover:shadow-brand-teal/40 transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative h-full flex flex-col justify-between">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl w-fit group-hover:scale-110 transition-transform">
                  <Plus className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="font-bold text-white text-xl mb-1">Add Product</p>
                  <p className="text-sm text-white/80">Create new product entry</p>
                </div>
              </div>
            </Link>

            {/* Curations */}
            <Link
              href="/admin/curations"
              className="col-span-2 bg-white/60 backdrop-blur-lg rounded-2xl p-5 border border-white/40 shadow-xl hover:shadow-2xl hover:border-pink-500/40 transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="h-full flex flex-col justify-between">
                <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl w-fit shadow-lg shadow-pink-500/30 group-hover:scale-110 transition-transform">
                  <LayoutGrid className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-base">Curations</p>
                  <p className="text-xs text-gray-600">Product collections</p>
                </div>
              </div>
            </Link>

            {/* Categories */}
            <Link
              href="/admin/categories"
              className="col-span-2 bg-white/60 backdrop-blur-lg rounded-2xl p-5 border border-white/40 shadow-xl hover:shadow-2xl hover:border-blue-500/40 transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="h-full flex flex-col justify-between">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl w-fit shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                  <Tag className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-base">Categories</p>
                  <p className="text-xs text-gray-600">Organize products</p>
                </div>
              </div>
            </Link>

            {/* Brands */}
            <Link
              href="/admin/brands"
              className="col-span-2 bg-white/60 backdrop-blur-lg rounded-2xl p-5 border border-white/40 shadow-xl hover:shadow-2xl hover:border-purple-500/40 transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="h-full flex flex-col justify-between">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl w-fit shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-base">Brands</p>
                  <p className="text-xs text-gray-600">Manage brands</p>
                </div>
              </div>
            </Link>

            {/* Reviews */}
            <Link
              href="/admin/reviews"
              className="col-span-2 bg-white/60 backdrop-blur-lg rounded-2xl p-5 border border-white/40 shadow-xl hover:shadow-2xl hover:border-yellow-500/40 transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="h-full flex flex-col justify-between">
                <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl w-fit shadow-lg shadow-yellow-500/30 group-hover:scale-110 transition-transform">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-base">Reviews</p>
                  <p className="text-xs text-gray-600">Moderate content</p>
                </div>
              </div>
            </Link>

            {/* AI Content - Tall card */}
            <Link
              href="/admin/ai-content"
              className="col-span-2 row-span-2 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-600 backdrop-blur-xl rounded-3xl p-6 shadow-2xl shadow-purple-500/20 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative h-full flex flex-col justify-between">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl w-fit group-hover:scale-110 transition-transform">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="font-bold text-white text-xl mb-1">AI Content</p>
                  <p className="text-sm text-white/80">Generate with AI</p>
                </div>
              </div>
            </Link>

            {/* Feedback */}
            <Link
              href="/admin/feedback"
              className="col-span-2 bg-white/60 backdrop-blur-lg rounded-2xl p-5 border border-white/40 shadow-xl hover:shadow-2xl hover:border-emerald-500/40 transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="h-full flex flex-col justify-between">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl w-fit shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-base">Feedback</p>
                  <p className="text-xs text-gray-600">User feedback</p>
                </div>
              </div>
            </Link>

            {/* Users */}
            <Link
              href="/admin/users"
              className="col-span-2 bg-white/60 backdrop-blur-lg rounded-2xl p-5 border border-white/40 shadow-xl hover:shadow-2xl hover:border-cyan-500/40 transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="h-full flex flex-col justify-between">
                <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl w-fit shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-base">Users</p>
                  <p className="text-xs text-gray-600">Manage users</p>
                </div>
              </div>
            </Link>

            {/* Subscribers */}
            <Link
              href="/admin/subscribers"
              className="col-span-2 bg-white/60 backdrop-blur-lg rounded-2xl p-5 border border-white/40 shadow-xl hover:shadow-2xl hover:border-green-500/40 transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="h-full flex flex-col justify-between">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl w-fit shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-base">Subscribers</p>
                  <p className="text-xs text-gray-600">Newsletter list</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Main Content Sections with Glassmorphism */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Products */}
          <div className="bg-white/60 backdrop-blur-lg rounded-2xl border border-white/40 shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/40 bg-gradient-to-r from-brand-teal/5 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-gradient-to-br from-brand-teal to-blue-600 rounded-lg">
                    <ShoppingBag className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-base font-bold text-gray-900">Recent Products</h2>
                </div>
                <Link
                  href="/admin/products"
                  className="text-xs text-brand-teal hover:text-brand-teal/80 font-semibold transition-colors"
                >
                  View All →
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-600 mb-3">No recent products</p>
                <Link
                  href="/admin/products/new"
                  className="inline-flex items-center px-4 py-2 text-xs text-white font-semibold bg-gradient-to-r from-brand-teal to-blue-600 rounded-lg hover:shadow-lg hover:shadow-brand-teal/30 transition-all"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add your first product
                </Link>
              </div>
            </div>
          </div>

          {/* Pending Reviews */}
          <div className="bg-white/60 backdrop-blur-lg rounded-2xl border border-white/40 shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/40 bg-gradient-to-r from-yellow-500/5 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg">
                    <Star className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-base font-bold text-gray-900">Pending Reviews</h2>
                </div>
                <Link
                  href="/admin/reviews"
                  className="text-xs text-brand-teal hover:text-brand-teal/80 font-semibold transition-colors"
                >
                  View All →
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                  <Star className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-600">No pending reviews</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
