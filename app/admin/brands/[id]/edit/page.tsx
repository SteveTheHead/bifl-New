'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { BrandForm, type BrandFormValues } from '@/components/admin/brand-form'

export default function EditBrandPage() {
  const params = useParams<{ id: string }>()
  const brandId = params.id
  const [initialValues, setInitialValues] = useState<Partial<BrandFormValues> | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(`/api/admin/brands/${brandId}`)
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Failed to load brand')
        const b = data.brand
        setInitialValues({
          name: b.name ?? '',
          slug: b.slug ?? '',
          description: b.description ?? '',
          website: b.website ?? '',
          country: b.country ?? '',
          founded_year: b.founded_year != null ? String(b.founded_year) : '',
          warranty_info: b.warranty_info ?? '',
          is_featured: !!b.is_featured,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load brand')
      }
    }
    load()
  }, [brandId])

  return (
    <div className="min-h-screen bg-brand-cream">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 space-x-4">
            <Link href="/admin/brands" className="text-brand-gray hover:text-brand-dark">
              ← Brands
            </Link>
            <h1 className="text-2xl font-bold text-brand-dark">Edit Brand</h1>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 max-w-2xl">
            {error}
          </div>
        ) : initialValues ? (
          <BrandForm brandId={brandId} initialValues={initialValues} />
        ) : (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal"></div>
          </div>
        )}
      </div>
    </div>
  )
}
