'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Save, ArrowLeft, Plus, Trash2, Sparkles, Loader2, Upload, X } from 'lucide-react'

interface Curation {
  id: string
  name: string
  slug: string
}

interface BuyingCriteria {
  title: string
  description: string
  icon: string
}

interface FAQ {
  question: string
  answer: string
}

export default function NewGuidePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [aiGenerating, setAiGenerating] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [curations, setCurations] = useState<Curation[]>([])

  // Form state
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [featuredImageUrl, setFeaturedImageUrl] = useState('')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [introContent, setIntroContent] = useState('')
  const [curationId, setCurationId] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [buyingCriteria, setBuyingCriteria] = useState<BuyingCriteria[]>([])
  const [faqs, setFaqs] = useState<FAQ[]>([])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/session')
        const data = await response.json()
        if (data.isAuthenticated) {
          setIsAuthenticated(true)
          fetchCurations()
        } else {
          router.push('/admin/signin')
        }
      } catch (error) {
        router.push('/admin/signin')
      }
    }
    checkAuth()
  }, [router])

  const fetchCurations = async () => {
    try {
      const response = await fetch('/api/admin/curations')
      const data = await response.json()
      // API returns array directly, not wrapped
      setCurations(Array.isArray(data) ? data : data.curations || [])
    } catch (error) {
      console.error('Failed to fetch curations:', error)
    }
  }

  // Auto-generate slug from title
  useEffect(() => {
    if (title && !slug) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      setSlug(generatedSlug)
    }
  }, [title, slug])

  const addCriteria = () => {
    setBuyingCriteria([...buyingCriteria, { title: '', description: '', icon: 'fabric' }])
  }

  const updateCriteria = (index: number, field: keyof BuyingCriteria, value: string) => {
    const updated = [...buyingCriteria]
    updated[index][field] = value
    setBuyingCriteria(updated)
  }

  const removeCriteria = (index: number) => {
    setBuyingCriteria(buyingCriteria.filter((_, i) => i !== index))
  }

  const addFaq = () => {
    setFaqs([...faqs, { question: '', answer: '' }])
  }

  const updateFaq = (index: number, field: keyof FAQ, value: string) => {
    const updated = [...faqs]
    updated[index][field] = value
    setFaqs(updated)
  }

  const removeFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setFeaturedImageUrl(data.url)
    } catch (error) {
      console.error('Upload error:', error)
      alert(error instanceof Error ? error.message : 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const generateWithAI = async () => {
    if (!curationId) {
      alert('Please select a curation first to generate AI content')
      return
    }

    setAiGenerating(true)
    try {
      const response = await fetch('/api/admin/ai/generate-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          curationId,
          guideTitle: title
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate content')
      }

      // Update form with generated content
      if (data.intro_content) {
        setIntroContent(data.intro_content)
      }
      if (data.buying_criteria && data.buying_criteria.length > 0) {
        setBuyingCriteria(data.buying_criteria)
      }
      if (data.faqs && data.faqs.length > 0) {
        setFaqs(data.faqs)
      }
    } catch (error) {
      console.error('AI generation error:', error)
      alert(error instanceof Error ? error.message : 'Failed to generate AI content')
    } finally {
      setAiGenerating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/admin/guides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          featured_image_url: featuredImageUrl || null,
          meta_title: metaTitle || title,
          meta_description: metaDescription,
          intro_content: introContent,
          curation_id: curationId || null,
          is_published: isPublished,
          buying_criteria: buyingCriteria.filter(c => c.title && c.description),
          faqs: faqs.filter(f => f.question && f.answer),
        }),
      })

      if (response.ok) {
        router.push('/admin/guides')
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to create guide')
      }
    } catch (error) {
      console.error('Failed to create guide:', error)
      alert('Failed to create guide')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/admin/guides" className="text-gray-500 hover:text-gray-700 flex items-center">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Guides
              </Link>
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading || !title || !slug}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Guide'}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Best Buy It For Life Backpacks in 2025"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL Slug *
                </label>
                <div className="flex items-center">
                  <span className="text-gray-500 mr-2">/guides/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="best-bifl-backpacks"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Featured Image
                </label>

                {featuredImageUrl ? (
                  <div className="relative inline-block">
                    <img
                      src={featuredImageUrl}
                      alt="Featured preview"
                      className="h-40 w-auto object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-image.png'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setFeaturedImageUrl('')}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-lg border border-teal-200 hover:bg-teal-100 cursor-pointer transition-colors">
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>Upload Image</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                    <span className="text-gray-400">or</span>
                    <input
                      type="url"
                      value={featuredImageUrl}
                      onChange={(e) => setFeaturedImageUrl(e.target.value)}
                      placeholder="Paste image URL"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                    />
                  </div>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  Recommended: 1200x630px for best display on social media
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link to Curation
                </label>
                <select
                  value={curationId}
                  onChange={(e) => setCurationId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="">No curation (manual product selection)</option>
                  {curations.map((curation) => (
                    <option key={curation.id} value={curation.id}>
                      {curation.name}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  Select a curation to automatically include its products in this guide
                </p>
              </div>

              {/* AI Assist Button */}
              {curationId && (
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-purple-900 flex items-center">
                        <Sparkles className="w-4 h-4 mr-2 text-purple-600" />
                        AI Content Assistant
                      </h3>
                      <p className="text-xs text-purple-700 mt-1">
                        Generate intro, buying criteria, and FAQs based on your curation's products
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={generateWithAI}
                      disabled={aiGenerating}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 disabled:opacity-50 text-sm font-medium"
                    >
                      {aiGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Generate with AI</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                />
                <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">
                  Publish immediately
                </label>
              </div>
            </div>
          </div>

          {/* SEO */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">SEO</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Leave blank to use guide title"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Description
                </label>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Brief description for search engines (150-160 characters)"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {metaDescription.length}/160 characters
                </p>
              </div>
            </div>
          </div>

          {/* Intro Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Introduction</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Intro Content
              </label>
              <textarea
                value={introContent}
                onChange={(e) => setIntroContent(e.target.value)}
                placeholder="Write an engaging introduction. Use double line breaks for paragraphs."
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Tip: Mention that you scour Reddit, Amazon, YouTube, and the web for real recommendations.
              </p>
            </div>
          </div>

          {/* Buying Criteria */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Buying Criteria</h2>
              <button
                type="button"
                onClick={addCriteria}
                className="text-teal-600 hover:text-teal-700 flex items-center space-x-1 text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>Add Criteria</span>
              </button>
            </div>

            {buyingCriteria.length === 0 ? (
              <p className="text-gray-500 text-sm">No buying criteria added yet.</p>
            ) : (
              <div className="space-y-4">
                {buyingCriteria.map((criteria, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-sm font-medium text-gray-500">Criteria {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeCriteria(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={criteria.title}
                        onChange={(e) => updateCriteria(index, 'title', e.target.value)}
                        placeholder="e.g., Material Quality"
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <select
                        value={criteria.icon}
                        onChange={(e) => updateCriteria(index, 'icon', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="fabric">Fabric</option>
                        <option value="stitch">Stitching</option>
                        <option value="zipper">Zipper</option>
                        <option value="repair">Repair</option>
                        <option value="warranty">Warranty</option>
                      </select>
                    </div>
                    <textarea
                      value={criteria.description}
                      onChange={(e) => updateCriteria(index, 'description', e.target.value)}
                      placeholder="Description of this criteria..."
                      rows={2}
                      className="w-full mt-3 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* FAQs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">FAQs</h2>
              <button
                type="button"
                onClick={addFaq}
                className="text-teal-600 hover:text-teal-700 flex items-center space-x-1 text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>Add FAQ</span>
              </button>
            </div>

            {faqs.length === 0 ? (
              <p className="text-gray-500 text-sm">No FAQs added yet.</p>
            ) : (
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-sm font-medium text-gray-500">FAQ {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeFaq(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => updateFaq(index, 'question', e.target.value)}
                      placeholder="Question"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2"
                    />
                    <textarea
                      value={faq.answer}
                      onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                      placeholder="Answer"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !title || !slug}
              className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{loading ? 'Creating...' : 'Create Guide'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
