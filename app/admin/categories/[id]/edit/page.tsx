'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Save, X } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  display_order: number
  is_featured: boolean
  created_at: string
}

export default function EditCategoryPage() {
  const router = useRouter()
  const params = useParams()
  const categoryId = params.id as string

  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState<Category | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    display_order: 0,
    is_featured: false
  })

  useEffect(() => {
    checkSession()
  }, [])

  useEffect(() => {
    if (session && categoryId) {
      fetchCategory()
    }
  }, [session, categoryId])

  const checkSession = async () => {
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
  }

  const fetchCategory = async () => {
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`)
      if (response.ok) {
        const data = await response.json()
        const category = data.category
        setCategory(category)

        // Populate form with existing category data
        setFormData({
          name: category.name || '',
          slug: category.slug || '',
          description: category.description || '',
          display_order: category.display_order || 0,
          is_featured: category.is_featured || false
        })
      } else {
        router.push('/admin/categories')
      }
    } catch (error) {
      console.error('Failed to fetch category:', error)
      router.push('/admin/categories')
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
    setSaving(true)

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          display_order: parseInt(formData.display_order.toString())
        })
      })

      if (response.ok) {
        router.push('/admin/categories')
      } else {
        const error = await response.json()
        alert(`Failed to update category: ${error.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Failed to update category:', error)
      alert('Failed to update category')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal"></div>
      </div>
    )
  }

  if (!session || !category) {
    return null
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/categories"
                className="text-brand-gray hover:text-brand-dark"
              >
                ← Categories
              </Link>
              <h1 className="text-2xl font-bold text-brand-dark">Edit Category</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-brand-dark mb-6">Basic Information</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-brand-gray mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  placeholder="Enter category name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-gray mb-2">
                  URL Slug *
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  placeholder="category-url-slug"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-gray mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  placeholder="Optional description for this category"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-brand-gray mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.display_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-gray mb-2">
                    Featured Category
                  </label>
                  <div className="flex items-center h-10">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                      className="h-4 w-4 text-brand-teal focus:ring-brand-teal border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-brand-gray">
                      Show in featured categories
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4">
            <Link
              href="/admin/categories"
              className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg text-brand-gray hover:text-brand-dark hover:border-gray-400 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}