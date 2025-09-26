'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@/components/auth/auth-client'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Tag,
  ArrowUpDown
} from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  display_order: number
  is_featured: boolean
  created_at: string
}

export default function AdminCategoriesPage() {
  const { data: session, isPending } = useSession()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

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
      fetchCategories()
    }
  }, [isAdmin])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/categories')
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setCategories(categories.filter(c => c.id !== categoryId))
      } else {
        alert('Failed to delete category')
      }
    } catch (error) {
      console.error('Failed to delete category:', error)
      alert('Failed to delete category')
    }
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isPending || !isAdmin) {
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
              <h1 className="text-2xl font-bold text-brand-dark">Category Management</h1>
            </div>
            <Link
              href="/admin/categories/new"
              className="bg-brand-teal text-white px-4 py-2 rounded-lg hover:bg-brand-teal/90 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-gray w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Categories Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal"></div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
            <Tag className="w-16 h-16 text-brand-gray mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-brand-dark mb-2">No Categories Found</h3>
            <p className="text-brand-gray mb-6">
              {searchTerm
                ? 'Try adjusting your search'
                : 'Get started by adding your first category'
              }
            </p>
            <Link
              href="/admin/categories/new"
              className="bg-brand-teal text-white px-6 py-3 rounded-lg hover:bg-brand-teal/90 transition-colors"
            >
              Add Category
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-brand-gray uppercase tracking-wider">
                      <div className="flex items-center space-x-1">
                        <span>Name</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-brand-gray uppercase tracking-wider">
                      Slug
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-brand-gray uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-brand-gray uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-brand-gray uppercase tracking-wider">
                      Featured
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-brand-gray uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-brand-dark">{category.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-brand-gray">{category.slug}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-brand-gray max-w-xs truncate">
                          {category.description || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-brand-gray">{category.display_order}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          category.is_featured
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {category.is_featured ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/admin/categories/${category.id}/edit`}
                            className="text-brand-teal hover:text-brand-teal/80"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => deleteCategory(category.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}