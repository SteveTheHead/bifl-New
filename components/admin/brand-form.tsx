'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export interface BrandFormValues {
  name: string
  slug: string
  description: string
  website: string
  country: string
  founded_year: string
  warranty_info: string
  is_featured: boolean
}

const EMPTY: BrandFormValues = {
  name: '',
  slug: '',
  description: '',
  website: '',
  country: '',
  founded_year: '',
  warranty_info: '',
  is_featured: false,
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Create/edit form shared by /admin/brands/new and /admin/brands/[id]/edit. */
export function BrandForm({
  brandId,
  initialValues,
}: {
  /** When set, the form PUTs to /api/admin/brands/[id]; otherwise POSTs. */
  brandId?: string
  initialValues?: Partial<BrandFormValues>
}) {
  const router = useRouter()
  const [values, setValues] = useState<BrandFormValues>({ ...EMPTY, ...initialValues })
  const [slugTouched, setSlugTouched] = useState(!!brandId)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (patch: Partial<BrandFormValues>) => setValues((v) => ({ ...v, ...patch }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = {
      name: values.name.trim(),
      slug: values.slug.trim(),
      description: values.description.trim() || null,
      website: values.website.trim() || '',
      country: values.country.trim() || null,
      founded_year: values.founded_year ? Number(values.founded_year) : null,
      warranty_info: values.warranty_info.trim() || null,
      is_featured: values.is_featured,
    }

    try {
      const response = await fetch(brandId ? `/api/admin/brands/${brandId}` : '/api/admin/brands', {
        method: brandId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      if (!response.ok) {
        const details = data.details ? ` (${Object.entries(data.details).map(([k, v]) => `${k}: ${v}`).join('; ')})` : ''
        throw new Error(`${data.error || 'Save failed'}${details}`)
      }
      router.push('/admin/brands')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
      setSaving(false)
    }
  }

  const input = 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal'
  const label = 'block text-sm font-medium text-brand-dark mb-1'

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 space-y-6 max-w-2xl">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="brand-name" className={label}>Name *</label>
        <input
          id="brand-name"
          type="text"
          required
          value={values.name}
          onChange={(e) => {
            set({ name: e.target.value, ...(slugTouched ? {} : { slug: slugify(e.target.value) }) })
          }}
          className={input}
        />
      </div>

      <div>
        <label htmlFor="brand-slug" className={label}>Slug *</label>
        <input
          id="brand-slug"
          type="text"
          required
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          title="Lowercase letters, numbers, and hyphens"
          value={values.slug}
          onChange={(e) => {
            setSlugTouched(true)
            set({ slug: e.target.value })
          }}
          className={input}
        />
      </div>

      <div>
        <label htmlFor="brand-description" className={label}>Description</label>
        <textarea
          id="brand-description"
          rows={4}
          value={values.description}
          onChange={(e) => set({ description: e.target.value })}
          className={input}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="brand-website" className={label}>Website</label>
          <input
            id="brand-website"
            type="url"
            placeholder="https://..."
            value={values.website}
            onChange={(e) => set({ website: e.target.value })}
            className={input}
          />
        </div>
        <div>
          <label htmlFor="brand-country" className={label}>Country</label>
          <input
            id="brand-country"
            type="text"
            value={values.country}
            onChange={(e) => set({ country: e.target.value })}
            className={input}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="brand-founded" className={label}>Founded Year</label>
          <input
            id="brand-founded"
            type="number"
            min={1600}
            max={2100}
            value={values.founded_year}
            onChange={(e) => set({ founded_year: e.target.value })}
            className={input}
          />
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={values.is_featured}
              onChange={(e) => set({ is_featured: e.target.checked })}
              className="w-4 h-4 text-brand-teal border-gray-300 rounded focus:ring-brand-teal"
            />
            <span className="text-sm font-medium text-brand-dark">Featured brand</span>
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="brand-warranty" className={label}>Warranty Info</label>
        <textarea
          id="brand-warranty"
          rows={3}
          placeholder="e.g. Lifetime warranty on all stitching and hardware"
          value={values.warranty_info}
          onChange={(e) => set({ warranty_info: e.target.value })}
          className={input}
        />
      </div>

      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-brand-teal text-white px-6 py-2 rounded-lg hover:bg-brand-teal/90 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : brandId ? 'Save Changes' : 'Create Brand'}
        </button>
        <Link href="/admin/brands" className="text-brand-gray hover:text-brand-dark">
          Cancel
        </Link>
      </div>
    </form>
  )
}
