'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Star,
  Package,
  RefreshCw
} from 'lucide-react'

interface Product {
  id: string
  name: string
  brand_name: string
  category_name: string
  featured_image_url: string | null
  bifl_total_score: number | null
  price: number | null
  status: string
  is_featured: boolean
  created_at: string
}

export default function AdminProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('created_at')

  // Check admin session via API
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/session')
        const data = await response.json()
        if (data.isAuthenticated) {
          setIsAuthenticated(true)
          fetchProducts()
        } else {
          router.push('/admin/signin')
        }
      } catch (error) {
        router.push('/admin/signin')
      }
    }
    checkAuth()
  }, [router])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      console.log('Fetching products...')
      const response = await fetch('/api/admin/products')
      const data = await response.json()
      console.log('Products fetched:', data.products?.length || 0)
      setProducts(data.products || [])
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setProducts(products.filter(p => p.id !== productId))
      } else {
        alert('Failed to delete product')
      }
    } catch (error) {
      console.error('Failed to delete product:', error)
      alert('Failed to delete product')
    }
  }

  const toggleFeatured = async (productId: string, currentFeaturedStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}/featured`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_featured: !currentFeaturedStatus }),
      })

      if (response.ok) {
        // Update the local state
        setProducts(products.map(p =>
          p.id === productId
            ? { ...p, is_featured: !currentFeaturedStatus }
            : p
        ))
      } else {
        alert('Failed to toggle featured status')
      }
    } catch (error) {
      console.error('Error toggling featured status:', error)
      alert('Failed to toggle featured status')
    }
  }

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = (product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (product.brand_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (product.category_name || '').toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === 'all' || product.status === statusFilter

      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '')
        case 'score':
          return (b.bifl_total_score || 0) - (a.bifl_total_score || 0)
        case 'featured':
          if (a.is_featured === b.is_featured) {
            return (b.bifl_total_score || 0) - (a.bifl_total_score || 0) // Secondary sort by score
          }
          return a.is_featured ? -1 : 1 // Featured items first
        case 'created_at':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin"
                className="text-brand-gray hover:text-brand-dark"
              >
                ← Admin Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-brand-dark">Product Management</h1>
              <div className="bg-brand-teal/10 text-brand-teal px-3 py-1 rounded-full text-sm font-semibold">
                {filteredProducts.length} {filteredProducts.length !== products.length && `/ ${products.length}`}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchProducts}
                disabled={loading}
                className="bg-white text-brand-dark border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <Link
                href="/admin/products/new"
                className="bg-brand-teal text-white px-4 py-2 rounded-lg hover:bg-brand-teal/90 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-gray w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search products, brands, categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                />
              </div>
            </div>
            <div className="min-w-[200px]">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="min-w-[200px]">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
              >
                <option value="created_at">Newest First</option>
                <option value="name">Name A-Z</option>
                <option value="score">Highest Score</option>
                <option value="featured">Featured First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
            <Package className="w-16 h-16 text-brand-gray mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-brand-dark mb-2">No Products Found</h3>
            <p className="text-brand-gray mb-6">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first product to the directory'
              }
            </p>
            <Link
              href="/admin/products/new"
              className="bg-brand-teal text-white px-6 py-3 rounded-lg hover:bg-brand-teal/90 transition-colors"
            >
              Add Product
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                {/* Product Image */}
                <div className="relative h-48 bg-white border border-gray-100 rounded-lg">
                  {product.featured_image_url ? (
                    <Image
                      src={product.featured_image_url}
                      alt={product.name}
                      fill
                      className="object-contain p-3"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.status === 'published' ? 'bg-green-100 text-green-800' :
                      product.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {product.status}
                    </span>
                  </div>
                  {product.bifl_total_score && (
                    <div className="absolute top-3 right-3">
                      <div className="bg-brand-teal text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{product.bifl_total_score.toFixed(1)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <div className="mb-3">
                    <h3 className="font-semibold text-lg text-brand-dark line-clamp-2">{product.name || 'Untitled Product'}</h3>
                    <p className="text-sm text-brand-gray">
                      {product.brand_name || 'No Brand'} • {product.category_name || 'No Category'}
                    </p>
                  </div>

                  {product.price && (
                    <div className="mb-4">
                      <span className="text-lg font-bold text-brand-dark">${product.price}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/products/${product.id}`}
                      className="flex-1 bg-brand-cream text-brand-dark px-3 py-2 rounded-lg hover:bg-brand-cream/80 transition-colors text-center text-sm font-medium flex items-center justify-center space-x-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </Link>
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="flex-1 bg-gray-800 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-center text-sm font-medium flex items-center justify-center space-x-1"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </Link>
                    <button
                      onClick={() => toggleFeatured(product.id, product.is_featured)}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        product.is_featured
                          ? 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100'
                          : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
                      }`}
                      title={product.is_featured ? 'Remove from featured' : 'Add to featured'}
                    >
                      <Star className={`w-4 h-4 ${product.is_featured ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}