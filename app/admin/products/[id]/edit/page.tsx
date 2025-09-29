'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Save, X, Plus, Trash2 } from 'lucide-react'
import { FAQEditor } from '@/components/admin/faq-editor'
import { ProsConsEditor } from '@/components/admin/proscons-editor'

interface Category {
  id: string
  name: string
}

interface Brand {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  slug: string
  brand_id: string
  category_id: string
  excerpt: string | null
  description: string | null
  optimized_product_description: string | null
  price: number | null
  featured_image_url: string | null
  gallery_images: string[] | null
  bifl_total_score: number | null
  durability_score: number | null
  repairability_score: number | null
  sustainability_score: number | null
  social_score: number | null
  warranty_score: number | null
  dimensions: string | null
  weight: string | null
  lifespan_expectation: number | null
  warranty_years: number | null
  country_of_origin: string | null
  use_case: string | null
  affiliate_link: string | null
  manufacturer_link: string | null
  verdict_summary: string | null
  verdict_bullets: string[] | null
  durability_notes: string | null
  repairability_notes: string | null
  sustainability_notes: string | null
  social_notes: string | null
  warranty_notes: string | null
  general_notes: string | null
  meta_title: string | null
  meta_description: string | null
  status: string
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const [session, setSession] = useState<{name?: string; email?: string; isAdmin?: boolean} | null>(null)
  const [loading, setLoading] = useState(true)
  const [product, setProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [saving, setSaving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [galleryUploadProgress, setGalleryUploadProgress] = useState(0)
  const [galleryUrlInput, setGalleryUrlInput] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    brand_id: '',
    category_id: '',
    excerpt: '',
    description: '',
    optimized_product_description: '',
    price: '',
    featured_image_url: '',
    gallery_images: [] as string[],
    bifl_total_score: '',
    durability_score: '',
    repairability_score: '',
    sustainability_score: '',
    social_score: '',
    warranty_score: '',
    dimensions: '',
    weight: '',
    lifespan_expectation: '',
    warranty_years: '',
    country_of_origin: '',
    use_case: '',
    affiliate_link: '',
    manufacturer_link: '',
    verdict_summary: '',
    verdict_bullets: [] as string[],
    durability_notes: '',
    repairability_notes: '',
    sustainability_notes: '',
    social_notes: '',
    warranty_notes: '',
    general_notes: '',
    meta_title: '',
    meta_description: '',
    bifl_certification: '',
    status: 'draft'
  })

  const checkSession = useCallback(async () => {
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
  }, [router])

  const fetchProduct = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`)
      if (response.ok) {
        const data = await response.json()
        const product = data.product
        setProduct(product)

        // Populate form with existing product data
        setFormData({
          name: product.name || '',
          slug: product.slug || '',
          brand_id: product.brand_id || '',
          category_id: product.category_id || '',
          excerpt: product.excerpt || '',
          description: product.description || '',
          optimized_product_description: product.optimized_product_description || '',
          price: product.price ? product.price.toString() : '',
          featured_image_url: product.featured_image_url || '',
          gallery_images: Array.isArray(product.gallery_images) ? product.gallery_images : [],
          bifl_total_score: product.bifl_total_score ? product.bifl_total_score.toString() : '',
          durability_score: product.durability_score ? product.durability_score.toString() : '',
          repairability_score: product.repairability_score ? product.repairability_score.toString() : '',
          sustainability_score: product.sustainability_score ? product.sustainability_score.toString() : '',
          social_score: product.social_score ? product.social_score.toString() : '',
          warranty_score: product.warranty_score ? product.warranty_score.toString() : '',
          dimensions: product.dimensions || '',
          weight: product.weight || '',
          lifespan_expectation: product.lifespan_expectation ? product.lifespan_expectation.toString() : '',
          warranty_years: product.warranty_years ? product.warranty_years.toString() : '',
          country_of_origin: product.country_of_origin || '',
          use_case: product.use_case || '',
          affiliate_link: product.affiliate_link || '',
          manufacturer_link: product.manufacturer_link || '',
          verdict_summary: product.verdict_summary || '',
          verdict_bullets: Array.isArray(product.verdict_bullets) ? product.verdict_bullets : [],
          durability_notes: product.durability_notes || '',
          repairability_notes: product.repairability_notes || '',
          sustainability_notes: product.sustainability_notes || '',
          social_notes: product.social_notes || '',
          warranty_notes: product.warranty_notes || '',
          general_notes: product.general_notes || '',
          meta_title: product.meta_title || '',
          meta_description: product.meta_description || '',
          bifl_certification: product.bifl_certification || '',
          status: product.status || 'draft'
        })
      } else {
        router.push('/admin/products')
      }
    } catch (error) {
      console.error('Failed to fetch product:', error)
      router.push('/admin/products')
    }
  }, [productId, router])

  useEffect(() => {
    checkSession()
  }, [checkSession])

  useEffect(() => {
    if (session && productId) {
      Promise.all([
        fetchProduct(),
        fetchCategoriesAndBrands()
      ])
    }
  }, [session, productId, fetchProduct])

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

  // Verdict bullets helper functions
  const addVerdictBullet = () => {
    setFormData(prev => ({
      ...prev,
      verdict_bullets: [...prev.verdict_bullets, '']
    }))
  }

  const updateVerdictBullet = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      verdict_bullets: prev.verdict_bullets.map((bullet, i) =>
        i === index ? value : bullet
      )
    }))
  }

  const removeVerdictBullet = (index: number) => {
    setFormData(prev => ({
      ...prev,
      verdict_bullets: prev.verdict_bullets.filter((_, i) => i !== index)
    }))
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadProgress(10)

    try {
      const formData = new FormData()
      formData.append('file', file)

      setUploadProgress(50)

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData
      })

      setUploadProgress(80)

      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({ ...prev, featured_image_url: data.url }))
        setUploadProgress(100)
        setTimeout(() => setUploadProgress(0), 1000)
      } else {
        alert('Failed to upload image')
        setUploadProgress(0)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload image')
      setUploadProgress(0)
    }
  }

  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setGalleryUploadProgress(10)

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData
        })

        if (response.ok) {
          const data = await response.json()
          return data.url
        }
        throw new Error('Upload failed')
      })

      setGalleryUploadProgress(50)
      const uploadedUrls = await Promise.all(uploadPromises)
      setGalleryUploadProgress(90)

      setFormData(prev => ({
        ...prev,
        gallery_images: [...prev.gallery_images, ...uploadedUrls]
      }))

      setGalleryUploadProgress(100)
      setTimeout(() => setGalleryUploadProgress(0), 1000)
    } catch (error) {
      console.error('Gallery upload error:', error)
      alert('Failed to upload gallery images')
      setGalleryUploadProgress(0)
    }
  }

  const removeGalleryImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      gallery_images: prev.gallery_images.filter((_, index) => index !== indexToRemove)
    }))
  }

  const addGalleryImageByUrl = () => {
    if (!galleryUrlInput.trim()) return

    setFormData(prev => ({
      ...prev,
      gallery_images: [...prev.gallery_images, galleryUrlInput.trim()]
    }))

    setGalleryUrlInput('')
  }

  const handleGalleryUrlKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addGalleryImageByUrl()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          price: formData.price ? parseFloat(formData.price) : null,
          bifl_total_score: formData.bifl_total_score ? parseFloat(formData.bifl_total_score) : null,
          durability_score: formData.durability_score ? parseFloat(formData.durability_score) : null,
          repairability_score: formData.repairability_score ? parseFloat(formData.repairability_score) : null,
          sustainability_score: formData.sustainability_score ? parseFloat(formData.sustainability_score) : null,
          social_score: formData.social_score ? parseFloat(formData.social_score) : null,
          warranty_score: formData.warranty_score ? parseFloat(formData.warranty_score) : null,
          lifespan_expectation: formData.lifespan_expectation ? parseInt(formData.lifespan_expectation) : null,
          warranty_years: formData.warranty_years ? parseFloat(formData.warranty_years) : null
        })
      })

      if (response.ok) {
        router.push('/admin/products')
      } else {
        const error = await response.json()
        alert(`Failed to update product: ${error.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Failed to update product:', error)
      alert('Failed to update product')
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

  if (!session || !product) {
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
                href="/admin/products"
                className="text-brand-gray hover:text-brand-dark"
              >
                ← Products
              </Link>
              <h1 className="text-2xl font-bold text-brand-dark">Edit Product</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="submit"
                form="edit-product-form"
                disabled={saving}
                className="flex items-center space-x-2 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 font-medium shadow-sm border border-teal-700"
                style={{ backgroundColor: '#0d9488', color: 'white' }}
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Product'}</span>
              </button>
              <span className="text-sm text-brand-gray">
                {saving ? 'Please wait...' : 'Changes will be saved immediately'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form id="edit-product-form" onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-brand-dark mb-6">Basic Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-brand-gray mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  placeholder="Enter product name"
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
                  placeholder="product-url-slug"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-gray mb-2">
                  Brand *
                </label>
                <select
                  required
                  value={formData.brand_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, brand_id: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                >
                  <option value="">Select a brand</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-gray mb-2">
                  Category *
                </label>
                <select
                  required
                  value={formData.category_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-gray mb-2">
                  Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  placeholder="99.99"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-gray mb-2">
                  BIFL Score (0-10)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={formData.bifl_total_score}
                  onChange={(e) => setFormData(prev => ({ ...prev, bifl_total_score: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  placeholder="8.5"
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-brand-dark mb-6">Content</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-brand-gray mb-2">
                  Optimized Product Description
                </label>
                <textarea
                  rows={6}
                  value={formData.optimized_product_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, optimized_product_description: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  placeholder="Primary optimized description that will be displayed prominently on the product page..."
                />
                <p className="text-xs text-brand-gray mt-1">
                  This is the main description shown on product pages. If empty, will fall back to verdict summary, description, or excerpt.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-gray mb-2">
                  Short Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  placeholder="Brief description for product cards and previews"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-gray mb-2">
                  Full Description
                </label>
                <textarea
                  rows={8}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  placeholder="Detailed product description, features, and benefits"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-gray mb-2">
                  Featured Image
                </label>
                <div className="space-y-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  />
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-brand-teal h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  )}
                  <input
                    type="url"
                    value={formData.featured_image_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, featured_image_url: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                    placeholder="Or enter image URL directly"
                  />
                  {formData.featured_image_url && (
                    <div className="mt-2">
                      <Image
                        src={formData.featured_image_url}
                        alt="Preview"
                        width={300}
                        height={128}
                        className="max-w-xs h-32 object-cover rounded-lg border"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-gray mb-2">
                  Gallery Images
                </label>
                <div className="space-y-4">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryImageUpload}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  />
                  <p className="text-xs text-brand-gray">You can select multiple images at once</p>

                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={galleryUrlInput}
                      onChange={(e) => setGalleryUrlInput(e.target.value)}
                      onKeyPress={handleGalleryUrlKeyPress}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                      placeholder="Or enter image URL and press Enter"
                    />
                    <button
                      type="button"
                      onClick={addGalleryImageByUrl}
                      disabled={!galleryUrlInput.trim()}
                      className="px-4 py-2 bg-brand-teal text-white rounded-lg hover:bg-brand-teal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add
                    </button>
                  </div>

                  {galleryUploadProgress > 0 && galleryUploadProgress < 100 && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-brand-teal h-2 rounded-full transition-all duration-300"
                        style={{ width: `${galleryUploadProgress}%` }}
                      ></div>
                    </div>
                  )}

                  {formData.gallery_images.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-brand-gray mb-3">
                        Gallery Images ({formData.gallery_images.length})
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {formData.gallery_images.map((imageUrl, index) => (
                          <div key={index} className="relative group">
                            <Image
                              src={imageUrl}
                              alt={`Gallery ${index + 1}`}
                              width={96}
                              height={96}
                              className="w-full h-24 object-cover rounded-lg border"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => removeGalleryImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* BIFL Scores */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-brand-dark mb-6">BIFL Scores</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-brand-gray mb-2">
                  Overall BIFL Score (0-10)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={formData.bifl_total_score}
                  onChange={(e) => setFormData(prev => ({ ...prev, bifl_total_score: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  placeholder="8.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-gray mb-2">
                  Durability Score (0-10)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={formData.durability_score}
                  onChange={(e) => setFormData(prev => ({ ...prev, durability_score: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  placeholder="9.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-gray mb-2">
                  Repairability Score (0-10)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={formData.repairability_score}
                  onChange={(e) => setFormData(prev => ({ ...prev, repairability_score: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  placeholder="7.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-gray mb-2">
                  Sustainability Score (0-10)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={formData.sustainability_score}
                  onChange={(e) => setFormData(prev => ({ ...prev, sustainability_score: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  placeholder="8.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-gray mb-2">
                  Social Score (0-10)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={formData.social_score}
                  onChange={(e) => setFormData(prev => ({ ...prev, social_score: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  placeholder="6.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-gray mb-2">
                  Warranty Score (0-10)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={formData.warranty_score}
                  onChange={(e) => setFormData(prev => ({ ...prev, warranty_score: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  placeholder="8.5"
                />
              </div>
            </div>
          </div>

          {/* Score Notes */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-brand-dark mb-6">Score Notes</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-brand-gray mb-2">
                  Durability Notes
                </label>
                <textarea
                  rows={3}
                  value={formData.durability_notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, durability_notes: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  placeholder="Notes on product durability, build quality, materials..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-gray mb-2">
                  Repairability Notes
                </label>
                <textarea
                  rows={3}
                  value={formData.repairability_notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, repairability_notes: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  placeholder="Notes on ease of repair, spare parts availability, user serviceability..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-gray mb-2">
                  Sustainability Notes
                </label>
                <textarea
                  rows={3}
                  value={formData.sustainability_notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, sustainability_notes: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  placeholder="Notes on environmental impact, materials sourcing, recycling..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-gray mb-2">
                  Social Score Notes
                </label>
                <textarea
                  rows={3}
                  value={formData.social_notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, social_notes: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  placeholder="Notes on labor practices, community impact, ethical sourcing..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-gray mb-2">
                  Warranty Notes
                </label>
                <textarea
                  rows={3}
                  value={formData.warranty_notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, warranty_notes: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  placeholder="Notes on warranty coverage, terms, claim process..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-gray mb-2">
                  General Notes
                </label>
                <textarea
                  rows={3}
                  value={formData.general_notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, general_notes: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  placeholder="Additional notes or observations about the product..."
                />
              </div>
            </div>
          </div>

          {/* Product Specifications */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-brand-dark mb-6">Product Specifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-brand-gray mb-2">
                  Dimensions
                </label>
                <input
                  type="text"
                  value={formData.dimensions}
                  onChange={(e) => setFormData(prev => ({ ...prev, dimensions: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  placeholder="10 x 5 x 2 inches"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-gray mb-2">
                  Weight
                </label>
                <input
                  type="text"
                  value={formData.weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  placeholder="2.5 lbs"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-gray mb-2">
                  Expected Lifespan (years)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.lifespan_expectation}
                  onChange={(e) => setFormData(prev => ({ ...prev, lifespan_expectation: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  placeholder="25"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-gray mb-2">
                  Warranty (years)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.warranty_years}
                  onChange={(e) => setFormData(prev => ({ ...prev, warranty_years: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  placeholder="5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-gray mb-2">
                  Country of Origin
                </label>
                <input
                  type="text"
                  value={formData.country_of_origin}
                  onChange={(e) => setFormData(prev => ({ ...prev, country_of_origin: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  placeholder="United States"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-gray mb-2">
                  Use Case
                </label>
                <input
                  type="text"
                  value={formData.use_case}
                  onChange={(e) => setFormData(prev => ({ ...prev, use_case: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  placeholder="Outdoor activities, everyday carry"
                />
              </div>
            </div>
          </div>

          {/* Links & Verdict */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-brand-dark mb-6">Links & Verdict</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-brand-gray mb-2">
                    Affiliate Link
                  </label>
                  <input
                    type="url"
                    value={formData.affiliate_link}
                    onChange={(e) => setFormData(prev => ({ ...prev, affiliate_link: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                    placeholder="https://amazon.com/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-gray mb-2">
                    Manufacturer Link
                  </label>
                  <input
                    type="url"
                    value={formData.manufacturer_link}
                    onChange={(e) => setFormData(prev => ({ ...prev, manufacturer_link: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                    placeholder="https://manufacturer.com/..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-gray mb-2">
                  Verdict Summary
                </label>
                <textarea
                  rows={4}
                  value={formData.verdict_summary}
                  onChange={(e) => setFormData(prev => ({ ...prev, verdict_summary: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  placeholder="Our final thoughts and recommendation for this product..."
                />
              </div>

              {/* Verdict Bullet Points */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-brand-gray">
                    Verdict Bullet Points
                  </label>
                  <button
                    type="button"
                    onClick={addVerdictBullet}
                    className="flex items-center space-x-1 px-3 py-1 text-sm bg-brand-teal text-white rounded-lg hover:bg-brand-teal/90 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Bullet Point</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.verdict_bullets.map((bullet, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-brand-teal rounded-full mt-3"></div>
                      <input
                        type="text"
                        value={bullet}
                        onChange={(e) => updateVerdictBullet(index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                        placeholder={`Bullet point ${index + 1}...`}
                      />
                      <button
                        type="button"
                        onClick={() => removeVerdictBullet(index)}
                        className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {formData.verdict_bullets.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p className="mb-3">No verdict bullet points added yet.</p>
                      <button
                        type="button"
                        onClick={addVerdictBullet}
                        className="flex items-center space-x-1 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors mx-auto"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add First Bullet Point</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SEO Metadata */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-brand-dark mb-6">SEO Metadata</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-brand-gray mb-2">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={formData.meta_title}
                  onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  placeholder="Product Name - BIFL Products Review"
                  maxLength={60}
                />
                <p className="text-xs text-brand-gray mt-1">
                  {formData.meta_title.length}/60 characters (optimal: 50-60)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-gray mb-2">
                  Meta Description
                </label>
                <textarea
                  rows={3}
                  value={formData.meta_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  placeholder="A detailed review of [Product Name] including durability, repairability, and overall BIFL score..."
                  maxLength={160}
                />
                <p className="text-xs text-brand-gray mt-1">
                  {formData.meta_description.length}/160 characters (optimal: 150-160)
                </p>
              </div>
            </div>
          </div>

          {/* Badge Certification */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-brand-dark mb-6">Badge Certification</h2>
            <div>
              <label className="block text-sm font-medium text-brand-gray mb-2">
                BIFL Certification Badge
              </label>
              <select
                value={formData.bifl_certification}
                onChange={(e) => setFormData(prev => ({ ...prev, bifl_certification: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
              >
                <option value="">No Badge</option>
                <option value="Gold Standard">Gold Standard (9.0+ average across all scores)</option>
                <option value="Lifetime Warranty">Lifetime Warranty (Warranty score = 10)</option>
                <option value="Crowd Favorite">Crowd Favorite (Social score ≥ 8.5)</option>
                <option value="BIFL Approved">BIFL Approved (7.5+ across all categories)</option>
                <option value="Repair Friendly">Repair Friendly (Repairability score ≥ 8.5)</option>
                <option value="Eco Hero">Eco Hero (Sustainability score ≥ 8.0)</option>
              </select>
              <p className="text-xs text-brand-gray mt-1">
                Select the appropriate badge based on the product&apos;s BIFL scores
              </p>
            </div>
          </div>

          {/* Publishing */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-brand-dark mb-6">Publishing</h2>

            <div>
              <label className="block text-sm font-medium text-brand-gray mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Pros & Cons Editor */}
          <ProsConsEditor productId={productId} />

          {/* FAQ Editor */}
          <FAQEditor productId={productId} />

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Link
              href="/admin/products"
              className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg text-brand-gray hover:text-brand-dark hover:border-gray-400 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 font-medium shadow-sm border border-teal-700"
              style={{ backgroundColor: '#0d9488', color: 'white' }}
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Updating...' : 'Update Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}