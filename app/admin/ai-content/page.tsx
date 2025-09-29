'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Brain,
  FileText,
  BookOpen,
  GitCompare,
  Wand2,
  ArrowLeft,
  Copy,
  Download,
  Loader2
} from 'lucide-react'

interface Product {
  id: string
  name: string
  brand_name: string
  category_name: string
}

interface Category {
  id: string
  name: string
  description?: string
}

export default function AIContentGenerator() {
  const router = useRouter()
  const [session, setSession] = useState<{name?: string; email?: string; isAdmin?: boolean} | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [generatedContent, setGeneratedContent] = useState('')
  const [activeTab, setActiveTab] = useState<'product-description' | 'buying-guide' | 'comparison' | 'custom'>('product-description')

  // Form states
  const [selectedProduct, setSelectedProduct] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [customPrompt, setCustomPrompt] = useState('')

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

  useEffect(() => {
    checkSession()
    fetchData()
  }, [checkSession])

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/categories')
      ])

      if (productsRes.ok) {
        const productsData = await productsRes.json()
        setProducts(Array.isArray(productsData) ? productsData : [])
      } else {
        console.error('Failed to fetch products:', productsRes.status)
        setProducts([])
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json()
        setCategories(Array.isArray(categoriesData) ? categoriesData : [])
      } else {
        console.error('Failed to fetch categories:', categoriesRes.status)
        setCategories([])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
      setProducts([])
      setCategories([])
    }
  }

  const generateContent = async () => {
    setGenerating(true)
    setGeneratedContent('')

    try {
      const payload: {type: string; productId?: string; categoryId?: string; productIds?: string[]; customPrompt?: string} = { type: activeTab }

      switch (activeTab) {
        case 'product-description':
          payload.productId = selectedProduct
          break
        case 'buying-guide':
          payload.categoryId = selectedCategory
          break
        case 'comparison':
          payload.productIds = selectedProducts
          break
        case 'custom':
          payload.customPrompt = customPrompt
          break
      }

      const response = await fetch('/api/admin/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY || 'your-super-secret-admin-key-change-in-production'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate content')
      }

      setGeneratedContent(data.content)
    } catch (error) {
      console.error('Generation error:', error)
      alert('Failed to generate content. Please check your AI configuration.')
    } finally {
      setGenerating(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent)
    alert('Content copied to clipboard!')
  }

  const downloadContent = () => {
    const blob = new Blob([generatedContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeTab}-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link
                href="/admin"
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-brand-gray" />
              </Link>
              <h1 className="text-2xl font-bold text-brand-dark flex items-center">
                <Brain className="w-6 h-6 mr-2 text-brand-teal" />
                AI Content Generator
              </h1>
            </div>
            <div className="text-sm text-brand-gray">
              Welcome, {session?.name || session?.email}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Generator Controls */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-brand-dark mb-6">Content Generator</h2>

            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setActiveTab('product-description')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'product-description'
                    ? 'bg-brand-teal text-white'
                    : 'bg-gray-100 text-brand-gray hover:bg-gray-200'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                Product Description
              </button>
              <button
                onClick={() => setActiveTab('buying-guide')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'buying-guide'
                    ? 'bg-brand-teal text-white'
                    : 'bg-gray-100 text-brand-gray hover:bg-gray-200'
                }`}
              >
                <BookOpen className="w-4 h-4 inline mr-2" />
                Buying Guide
              </button>
              <button
                onClick={() => setActiveTab('comparison')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'comparison'
                    ? 'bg-brand-teal text-white'
                    : 'bg-gray-100 text-brand-gray hover:bg-gray-200'
                }`}
              >
                <GitCompare className="w-4 h-4 inline mr-2" />
                Product Comparison
              </button>
              <button
                onClick={() => setActiveTab('custom')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'custom'
                    ? 'bg-brand-teal text-white'
                    : 'bg-gray-100 text-brand-gray hover:bg-gray-200'
                }`}
              >
                <Wand2 className="w-4 h-4 inline mr-2" />
                Custom
              </button>
            </div>

            {/* Tab Content */}
            <div className="space-y-4 mb-6">
              {activeTab === 'product-description' && (
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">
                    Select Product
                  </label>
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-brand-teal focus:border-brand-teal"
                  >
                    <option value="">Choose a product...</option>
                    {(products || []).map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - {product.brand_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {activeTab === 'buying-guide' && (
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">
                    Select Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-brand-teal focus:border-brand-teal"
                  >
                    <option value="">Choose a category...</option>
                    {(categories || []).map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {activeTab === 'comparison' && (
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">
                    Select Products to Compare (2-5 products)
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3">
                    {(products || []).map((product) => (
                      <label key={product.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProducts([...selectedProducts, product.id])
                            } else {
                              setSelectedProducts(selectedProducts.filter(id => id !== product.id))
                            }
                          }}
                          className="mr-3 text-brand-teal"
                        />
                        <span className="text-sm">{product.name} - {product.brand_name}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-brand-gray mt-2">
                    Selected: {selectedProducts.length} products
                  </p>
                </div>
              )}

              {activeTab === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">
                    Custom Prompt
                  </label>
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Enter your custom prompt for content generation..."
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-brand-teal focus:border-brand-teal"
                  />
                </div>
              )}
            </div>

            {/* Generate Button */}
            <button
              onClick={generateContent}
              disabled={generating || (
                (activeTab === 'product-description' && !selectedProduct) ||
                (activeTab === 'buying-guide' && !selectedCategory) ||
                (activeTab === 'comparison' && selectedProducts.length < 2) ||
                (activeTab === 'custom' && !customPrompt.trim())
              )}
              className="w-full bg-brand-teal text-white py-3 px-6 rounded-lg font-medium hover:bg-brand-teal/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Generate Content
                </>
              )}
            </button>
          </div>

          {/* Generated Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-brand-dark">Generated Content</h2>
              {generatedContent && (
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="p-2 text-brand-gray hover:text-brand-dark transition-colors"
                    title="Copy to clipboard"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={downloadContent}
                    className="p-2 text-brand-gray hover:text-brand-dark transition-colors"
                    title="Download as text file"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-4 min-h-[400px]">
              {generating ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-brand-teal" />
                    <p className="text-brand-gray">Generating content...</p>
                  </div>
                </div>
              ) : generatedContent ? (
                <pre className="whitespace-pre-wrap text-sm text-brand-dark leading-relaxed">
                  {generatedContent}
                </pre>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-brand-gray">No content generated yet</p>
                    <p className="text-sm text-brand-gray mt-2">
                      Configure your generation settings and click &quot;Generate Content&quot;
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}