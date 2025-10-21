'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Curation {
  id: string
  name: string
  slug: string
  description: string | null
  featured_image_url: string | null
  is_active: boolean
  is_featured: boolean
  display_order: number
  created_at: string
  curation_products: any[]
}

export default function CurationsAdminPage() {
  const [curations, setCurations] = useState<Curation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCurations()
  }, [])

  async function fetchCurations() {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/curations')
      if (!response.ok) throw new Error('Failed to fetch curations')
      const data = await response.json()
      setCurations(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  async function deleteCuration(id: string) {
    if (!confirm('Are you sure you want to delete this curation?')) return

    try {
      const response = await fetch(`/api/admin/curations/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete curation')

      setCurations(curations.filter(c => c.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete curation')
    }
  }

  async function toggleActive(curation: Curation) {
    try {
      const response = await fetch(`/api/admin/curations/${curation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !curation.is_active }),
      })

      if (!response.ok) throw new Error('Failed to update curation')

      const updated = await response.json()
      setCurations(curations.map(c => c.id === updated.id ? updated : c))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update curation')
    }
  }

  async function toggleFeatured(curation: Curation) {
    try {
      const response = await fetch(`/api/admin/curations/${curation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: !curation.is_featured }),
      })

      if (!response.ok) throw new Error('Failed to update curation')

      const updated = await response.json()
      setCurations(curations.map(c => c.id === updated.id ? updated : c))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update curation')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-cream py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-brand-gray">Loading curations...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-brand-cream py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Error: {error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-cream py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="text-brand-teal hover:text-brand-dark transition-colors mb-4 inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between mt-4">
            <div>
              <h1 className="text-4xl font-bold text-brand-dark mb-2">Curations Management</h1>
              <p className="text-brand-gray">Create and manage product collections</p>
            </div>
            <Link
              href="/admin/curations/new"
              className="inline-flex items-center px-6 py-3 text-white rounded-lg font-semibold hover:bg-opacity-90 transition-all"
              style={{ backgroundColor: '#4A9D93' }}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Curation
            </Link>
          </div>
        </div>

        {/* Curations Grid */}
        {curations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-xl font-semibold text-brand-dark mb-2">No curations yet</h3>
            <p className="text-brand-gray mb-6">Get started by creating your first product collection</p>
            <Link
              href="/admin/curations/new"
              className="inline-flex items-center px-6 py-3 text-white rounded-lg font-semibold hover:bg-opacity-90 transition-all"
              style={{ backgroundColor: '#4A9D93' }}
            >
              Create Your First Curation
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {curations.map((curation) => (
              <div key={curation.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-6">
                  {/* Featured Image */}
                  <div className="flex-shrink-0">
                    {curation.featured_image_url ? (
                      <Image
                        src={curation.featured_image_url}
                        alt={curation.name}
                        width={120}
                        height={120}
                        className="w-30 h-30 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-30 h-30 bg-gray-200 rounded-lg flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Curation Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-2xl font-bold text-brand-dark mb-1">{curation.name}</h3>
                        <p className="text-sm text-brand-gray mb-2">/{curation.slug}</p>
                        {curation.description && (
                          <p className="text-brand-gray mb-3">{curation.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          curation.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {curation.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {curation.is_featured && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-brand-gray mb-4">
                      <span>{curation.curation_products?.length || 0} products</span>
                      <span>•</span>
                      <span>Display order: {curation.display_order}</span>
                      <span>•</span>
                      <span>Created {new Date(curation.created_at).toLocaleDateString()}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Link
                        href={`/admin/curations/${curation.id}/edit`}
                        className="px-4 py-2 text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-all"
                        style={{ backgroundColor: '#4A9D93' }}
                      >
                        Edit Details
                      </Link>
                      <Link
                        href={`/admin/curations/${curation.id}/products`}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-all"
                      >
                        Manage Products
                      </Link>
                      <button
                        onClick={() => toggleActive(curation)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          curation.is_active
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                      >
                        {curation.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => toggleFeatured(curation)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          curation.is_featured
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : 'bg-yellow-500 text-white hover:bg-yellow-600'
                        }`}
                      >
                        {curation.is_featured ? 'Unfeature' : 'Feature'}
                      </button>
                      <button
                        onClick={() => deleteCuration(curation.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-all"
                      >
                        Delete
                      </button>
                    </div>
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
