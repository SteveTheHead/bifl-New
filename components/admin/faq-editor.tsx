'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Save, GripVertical } from 'lucide-react'

interface FAQ {
  id?: string
  question: string
  answer: string
  display_order: number
  is_active: boolean
}

interface FAQEditorProps {
  productId: string
}

export function FAQEditor({ productId }: FAQEditorProps) {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchFAQs()
  }, [productId])

  const fetchFAQs = async () => {
    try {
      const response = await fetch(`/api/products/${productId}/faqs`)
      if (response.ok) {
        const data = await response.json()
        setFaqs(data.faqs || [])
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error)
    } finally {
      setLoading(false)
    }
  }

  const addFAQ = () => {
    setFaqs([
      ...faqs,
      {
        question: '',
        answer: '',
        display_order: faqs.length + 1,
        is_active: true
      }
    ])
  }

  const removeFAQ = async (index: number) => {
    const faq = faqs[index]
    if (faq.id) {
      // Delete from database
      try {
        await fetch(`/api/admin/faqs/${faq.id}`, { method: 'DELETE' })
      } catch (error) {
        console.error('Error deleting FAQ:', error)
      }
    }
    setFaqs(faqs.filter((_, i) => i !== index))
  }

  const updateFAQ = (index: number, field: keyof FAQ, value: any) => {
    const updated = [...faqs]
    updated[index] = { ...updated[index], [field]: value }
    setFaqs(updated)
  }

  const saveFAQs = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/faqs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, faqs })
      })

      if (response.ok) {
        alert('FAQs saved successfully!')
        fetchFAQs()
      } else {
        alert('Failed to save FAQs')
      }
    } catch (error) {
      console.error('Error saving FAQs:', error)
      alert('Error saving FAQs')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-4">Loading FAQs...</div>
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold">Product FAQs</h3>
        <button
          onClick={addFAQ}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add FAQ
        </button>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <GripVertical className="w-5 h-5 text-gray-400 mt-2 cursor-move" />

              <div className="flex-1 space-y-3">
                <input
                  type="text"
                  placeholder="Question"
                  value={faq.question}
                  onChange={(e) => updateFAQ(index, 'question', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />

                <textarea
                  placeholder="Answer"
                  value={faq.answer}
                  onChange={(e) => updateFAQ(index, 'answer', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={faq.is_active}
                      onChange={(e) => updateFAQ(index, 'is_active', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Active</span>
                  </label>

                  <span className="text-sm text-gray-500">
                    Order: {faq.display_order}
                  </span>
                </div>
              </div>

              <button
                onClick={() => removeFAQ(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {faqs.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No FAQs yet. Click "Add FAQ" to create one.
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={saveFAQs}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save All FAQs'}
        </button>
      </div>
    </div>
  )
}