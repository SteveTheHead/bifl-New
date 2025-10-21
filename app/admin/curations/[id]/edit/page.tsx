'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ImageUpload from '@/components/admin/ImageUpload'

interface Curation {
  id: string
  name: string
  slug: string
  description: string | null
  featured_image_url: string | null
  is_active: boolean
  is_featured: boolean
  display_order: number
}

export default function EditCurationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Curation | null>(null)

  useEffect(() => {
    fetchCuration()
  }, [])

  async function fetchCuration() {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/curations/${resolvedParams.id}`)
      if (!response.ok) throw new Error('Failed to fetch curation')
      const data = await response.json()
      setFormData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData) return

    setSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/curations/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update curation')
      }

      router.push('/admin/curations')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-cream py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-brand-gray">Loading...</p>
        </div>
      </div>
    )
  }

  if (!formData) {
    return (
      <div className="min-h-screen bg-brand-cream py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-red-800">Curation not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-cream py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/admin/curations"
              className="text-brand-teal hover:text-brand-dark transition-colors inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Curations
            </Link>
            <span className="text-brand-gray">|</span>
            <Link
              href="/admin"
              className="text-brand-gray hover:text-brand-dark transition-colors"
            >
              Dashboard
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-brand-dark mb-2">Edit Curation</h1>
          <p className="text-brand-gray">Update curation details</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-brand-dark mb-2">
                Name *
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent"
              />
            </div>

            {/* Slug */}
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-brand-dark mb-2">
                Slug *
              </label>
              <input
                type="text"
                id="slug"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent"
              />
              <p className="text-sm text-brand-gray mt-1">
                URL: /curations/{formData.slug}
              </p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-brand-dark mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent"
              />
            </div>

            {/* Featured Image */}
            <ImageUpload
              currentImageUrl={formData.featured_image_url}
              onImageUploaded={(url) => setFormData({ ...formData, featured_image_url: url })}
              bucket="curation-images"
              folder="featured"
            />

            {/* Display Order */}
            <div>
              <label htmlFor="display_order" className="block text-sm font-medium text-brand-dark mb-2">
                Display Order
              </label>
              <input
                type="number"
                id="display_order"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent"
              />
              <p className="text-sm text-brand-gray mt-1">
                Lower numbers appear first
              </p>
            </div>

            {/* Checkboxes */}
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 text-brand-teal border-gray-300 rounded focus:ring-brand-teal"
                />
                <label htmlFor="is_active" className="ml-3 text-sm font-medium text-brand-dark">
                  Active (visible to public)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="w-5 h-5 text-brand-teal border-gray-300 rounded focus:ring-brand-teal"
                />
                <label htmlFor="is_featured" className="ml-3 text-sm font-medium text-brand-dark">
                  Featured (show on homepage)
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-3 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#4A9D93' }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <Link
                href="/admin/curations"
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
