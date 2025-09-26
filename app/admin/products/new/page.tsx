'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@/components/auth/auth-client'
import { redirect, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Save, X, Upload } from 'lucide-react'

interface Category {
  id: string
  name: string
}

interface Brand {
  id: string
  name: string
}

export default function NewProductPage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    brand_id: '',
    category_id: '',
    excerpt: '',
    description: '',
    price: '',
    featured_image_url: '',
    bifl_total_score: '',
    status: 'draft'
  })

  const isAdmin = session?.user?.email?.endsWith('@bifl.com') ||
                 session?.user?.email === 'admin@example.com' ||
                 session?.user?.email === 'admin@bifl.dev' ||
                 process.env.NODE_ENV === 'development'

  useEffect(() => {
    if (!isPending && !isAdmin) {
      redirect('/auth/signin')
    }
  }, [session, isPending, isAdmin])

  useEffect(() => {
    if (isAdmin) {
      fetchCategoriesAndBrands()
    }
  }, [isAdmin])

  const fetchCategoriesAndBrands = async () => {
    try {
      const [categoriesRes, brandsRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/brands')
      ])

      const categoriesData = await categoriesRes.json()
      const brandsData = await brandsRes.json()

      setCategories(categoriesData.categories || [])
      setBrands(brandsData.brands || [])
    } catch (error) {
      console.error('Failed to fetch categories and brands:', error)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          price: formData.price ? parseFloat(formData.price) : null,
          bifl_total_score: formData.bifl_total_score ? parseFloat(formData.bifl_total_score) : null
        })
      })

      if (response.ok) {
        router.push('/admin/products')
      } else {
        const error = await response.json()
        alert(`Failed to create product: ${error.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Failed to create product:', error)
      alert('Failed to create product')
    } finally {
      setLoading(false)
    }
  }

  if (isPending || !isAdmin) {
    return (
      <div className=\"min-h-screen bg-brand-cream flex items-center justify-center\">
        <div className=\"animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal\"></div>
      </div>
    )
  }

  return (
    <div className=\"min-h-screen bg-brand-cream\">
      {/* Header */}
      <header className=\"bg-white shadow-sm border-b border-gray-200\">
        <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">
          <div className=\"flex justify-between items-center h-16\">
            <div className=\"flex items-center space-x-4\">
              <Link
                href=\"/admin/products\"
                className=\"text-brand-gray hover:text-brand-dark\"
              >
                ← Products
              </Link>
              <h1 className=\"text-2xl font-bold text-brand-dark\">Add New Product</h1>
            </div>
          </div>
        </div>
      </header>

      <div className=\"max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8\">
        <form onSubmit={handleSubmit} className=\"space-y-8\">
          {/* Basic Information */}
          <div className=\"bg-white rounded-xl p-6 shadow-sm border border-gray-100\">
            <h2 className=\"text-lg font-semibold text-brand-dark mb-6\">Basic Information</h2>

            <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6\">
              <div>
                <label className=\"block text-sm font-medium text-brand-gray mb-2\">
                  Product Name *
                </label>
                <input
                  type=\"text\"
                  required
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className=\"w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal\"
                  placeholder=\"Enter product name\"
                />
              </div>

              <div>
                <label className=\"block text-sm font-medium text-brand-gray mb-2\">
                  URL Slug *
                </label>
                <input
                  type=\"text\"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className=\"w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal\"
                  placeholder=\"product-url-slug\"
                />
              </div>

              <div>
                <label className=\"block text-sm font-medium text-brand-gray mb-2\">
                  Brand *
                </label>
                <select
                  required
                  value={formData.brand_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, brand_id: e.target.value }))}
                  className=\"w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal\"
                >
                  <option value=\"\">Select a brand</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className=\"block text-sm font-medium text-brand-gray mb-2\">
                  Category *
                </label>
                <select
                  required
                  value={formData.category_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                  className=\"w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal\"
                >
                  <option value=\"\">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className=\"block text-sm font-medium text-brand-gray mb-2\">
                  Price ($)
                </label>
                <input
                  type=\"number\"
                  step=\"0.01\"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  className=\"w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal\"
                  placeholder=\"99.99\"
                />
              </div>

              <div>
                <label className=\"block text-sm font-medium text-brand-gray mb-2\">
                  BIFL Score (0-10)
                </label>
                <input
                  type=\"number\"
                  step=\"0.1\"
                  min=\"0\"
                  max=\"10\"
                  value={formData.bifl_total_score}
                  onChange={(e) => setFormData(prev => ({ ...prev, bifl_total_score: e.target.value }))}
                  className=\"w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal\"
                  placeholder=\"8.5\"
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className=\"bg-white rounded-xl p-6 shadow-sm border border-gray-100\">
            <h2 className=\"text-lg font-semibold text-brand-dark mb-6\">Content</h2>

            <div className=\"space-y-6\">
              <div>
                <label className=\"block text-sm font-medium text-brand-gray mb-2\">
                  Short Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  className=\"w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal\"
                  placeholder=\"Brief description for product cards and previews\"
                />
              </div>

              <div>
                <label className=\"block text-sm font-medium text-brand-gray mb-2\">
                  Full Description
                </label>
                <textarea
                  rows={8}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className=\"w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal\"
                  placeholder=\"Detailed product description, features, and benefits\"
                />
              </div>

              <div>
                <label className=\"block text-sm font-medium text-brand-gray mb-2\">
                  Featured Image URL
                </label>
                <input
                  type=\"url\"
                  value={formData.featured_image_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, featured_image_url: e.target.value }))}
                  className=\"w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal\"
                  placeholder=\"https://example.com/product-image.jpg\"
                />
              </div>
            </div>
          </div>

          {/* Publishing */}
          <div className=\"bg-white rounded-xl p-6 shadow-sm border border-gray-100\">
            <h2 className=\"text-lg font-semibold text-brand-dark mb-6\">Publishing</h2>

            <div>
              <label className=\"block text-sm font-medium text-brand-gray mb-2\">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className=\"w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal\"
              >
                <option value=\"draft\">Draft</option>
                <option value=\"published\">Published</option>
                <option value=\"archived\">Archived</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className=\"flex items-center justify-between\">
            <Link
              href=\"/admin/products\"
              className=\"flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg text-brand-gray hover:text-brand-dark hover:border-gray-400 transition-colors\"
            >
              <X className=\"w-4 h-4\" />
              <span>Cancel</span>
            </Link>

            <button
              type=\"submit\"
              disabled={loading}
              className=\"flex items-center space-x-2 px-6 py-3 bg-brand-teal text-white rounded-lg hover:bg-brand-teal/90 transition-colors disabled:opacity-50\"
            >
              <Save className=\"w-4 h-4\" />
              <span>{loading ? 'Creating...' : 'Create Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}