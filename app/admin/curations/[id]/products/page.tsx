'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  slug: string
  featured_image_url: string | null
  price: number | null
  bifl_total_score: number | null
  brand?: { name: string; slug: string }
  category?: { name: string; slug: string }
}

interface CurationProduct {
  id: string
  product_id: string
  display_order: number
  products: Product
}

interface Curation {
  id: string
  name: string
  slug: string
  curation_products: CurationProduct[]
}

export default function ManageCurationProductsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [curation, setCuration] = useState<Curation | null>(null)
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      const [curationRes, productsRes] = await Promise.all([
        fetch(`/api/admin/curations/${resolvedParams.id}`),
        fetch('/api/products'),
      ])

      if (!curationRes.ok) throw new Error('Failed to fetch curation')
      if (!productsRes.ok) throw new Error('Failed to fetch products')

      const [curationData, productsData] = await Promise.all([
        curationRes.json(),
        productsRes.json(),
      ])

      setCuration(curationData)
      setAllProducts(productsData.products || productsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  async function addProduct(productId: string) {
    if (!curation) return

    try {
      setAdding(true)
      const nextOrder = Math.max(...curation.curation_products.map(cp => cp.display_order), -1) + 1

      const response = await fetch(`/api/admin/curations/${resolvedParams.id}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_ids: [productId], display_order: nextOrder }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to add product')
      }

      // Refresh curation data
      await fetchData()
      setSearchQuery('')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add product')
    } finally {
      setAdding(false)
    }
  }

  async function removeProduct(productId: string) {
    if (!confirm('Remove this product from the curation?')) return

    try {
      const response = await fetch(`/api/admin/curations/${resolvedParams.id}/products/${productId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to remove product')

      // Refresh curation data
      await fetchData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to remove product')
    }
  }

  async function updateProductOrder(productId: string, newOrder: number) {
    try {
      const response = await fetch(`/api/admin/curations/${resolvedParams.id}/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_order: newOrder }),
      })

      if (!response.ok) throw new Error('Failed to update order')

      // Refresh curation data
      await fetchData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update order')
    }
  }

  // Get products not already in curation
  const availableProducts = allProducts.filter(p =>
    !curation?.curation_products.some(cp => cp.product_id === p.id)
  )

  // Filter available products by search query
  const filteredProducts = availableProducts.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.brand?.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Sort curation products by display_order
  const sortedCurationProducts = [...(curation?.curation_products || [])].sort(
    (a, b) => a.display_order - b.display_order
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-cream py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-brand-gray">Loading...</p>
        </div>
      </div>
    )
  }

  if (error || !curation) {
    return (
      <div className="min-h-screen bg-brand-cream py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-red-800">{error || 'Curation not found'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-cream py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              className="text-brand-gray hover:text-brand-dark transition-colors inline-flex items-center"
            >
              Dashboard
            </Link>
            {curation.is_active && (
              <>
                <span className="text-brand-gray">|</span>
                <Link
                  href={`/curations/${curation.slug}`}
                  target="_blank"
                  className="text-brand-teal hover:text-brand-dark transition-colors inline-flex items-center"
                >
                  View Public Page
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              </>
            )}
          </div>
          <h1 className="text-4xl font-bold text-brand-dark mb-2">Manage Products</h1>
          <p className="text-brand-gray">{curation.name} - {sortedCurationProducts.length} products</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Current Products */}
          <div>
            <h2 className="text-2xl font-bold text-brand-dark mb-4">Current Products</h2>
            {sortedCurationProducts.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-brand-gray">No products added yet</p>
                <p className="text-sm text-brand-gray mt-2">Use the search on the right to add products</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedCurationProducts.map((cp, index) => (
                  <div key={cp.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div className="flex gap-4">
                      {/* Order Controls */}
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => updateProductOrder(cp.product_id, cp.display_order - 1)}
                          disabled={index === 0}
                          className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <span className="text-xs text-center text-brand-gray">{index + 1}</span>
                        <button
                          onClick={() => updateProductOrder(cp.product_id, cp.display_order + 1)}
                          disabled={index === sortedCurationProducts.length - 1}
                          className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>

                      {/* Product Image */}
                      {cp.products.featured_image_url && (
                        <Image
                          src={cp.products.featured_image_url}
                          alt={cp.products.name}
                          width={80}
                          height={80}
                          className="w-20 h-20 object-contain rounded"
                        />
                      )}

                      {/* Product Info */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-brand-dark">{cp.products.name}</h3>
                        <p className="text-sm text-brand-gray">{cp.products.brand?.name}</p>
                        {cp.products.bifl_total_score && (
                          <p className="text-sm text-brand-gray">Score: {cp.products.bifl_total_score.toFixed(1)}</p>
                        )}
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeProduct(cp.product_id)}
                        className="px-3 py-2 text-white rounded-lg text-sm font-medium transition-all h-fit"
                        style={{ backgroundColor: '#ef4444' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Products */}
          <div>
            <h2 className="text-2xl font-bold text-brand-dark mb-4">Add Products</h2>

            {/* Search */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent"
              />
            </div>

            {/* Available Products List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 max-h-[600px] overflow-y-auto">
              {filteredProducts.length === 0 ? (
                <p className="text-center text-brand-gray py-8">
                  {searchQuery ? 'No products found' : 'All products have been added'}
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredProducts.slice(0, 50).map((product) => (
                    <div key={product.id} className="flex gap-4 items-center border-b border-gray-100 pb-3 last:border-0">
                      {/* Product Image */}
                      {product.featured_image_url && (
                        <Image
                          src={product.featured_image_url}
                          alt={product.name}
                          width={60}
                          height={60}
                          className="w-15 h-15 object-contain rounded"
                        />
                      )}

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-brand-dark text-sm truncate">{product.name}</h4>
                        <p className="text-xs text-brand-gray">{product.brand?.name}</p>
                      </div>

                      {/* Add Button */}
                      <button
                        onClick={() => addProduct(product.id)}
                        disabled={adding}
                        className="px-3 py-1.5 text-white rounded text-sm font-medium hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        style={{ backgroundColor: '#4A9D93' }}
                      >
                        Add
                      </button>
                    </div>
                  ))}
                  {filteredProducts.length > 50 && (
                    <p className="text-sm text-brand-gray text-center pt-2">
                      Showing first 50 results. Refine your search to see more.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
