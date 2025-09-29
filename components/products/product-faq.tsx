'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react'

interface FAQ {
  id: string
  question: string
  answer: string
  display_order: number
}

interface ProductFAQProps {
  productId: string
}

export function ProductFAQ({ productId }: ProductFAQProps) {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchFAQs()
  }, [productId])

  const fetchFAQs = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/products/${productId}/faqs`)

      if (!response.ok) {
        throw new Error('Failed to fetch FAQs')
      }

      const data = await response.json()
      setFaqs(data.faqs || [])
    } catch (err) {
      console.error('Error fetching FAQs:', err)
      setError('Failed to load FAQs')
    } finally {
      setLoading(false)
    }
  }

  const toggleExpanded = (faqId: string) => {
    const newExpanded = new Set(expandedItems)
    if (expandedItems.has(faqId)) {
      newExpanded.delete(faqId)
    } else {
      newExpanded.add(faqId)
    }
    setExpandedItems(newExpanded)
  }

  if (loading) {
    return (
      <section className="mt-16 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center mb-6">
          <HelpCircle className="w-6 h-6 mr-3 text-brand-teal" />
          <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-100 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="mt-16 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center mb-6">
          <HelpCircle className="w-6 h-6 mr-3 text-brand-teal" />
          <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
        </div>
        <div className="text-center py-8">
          <p className="text-brand-gray">{error}</p>
        </div>
      </section>
    )
  }

  if (!faqs || faqs.length === 0) {
    return (
      <section className="mt-16 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center mb-6">
          <HelpCircle className="w-6 h-6 mr-3 text-brand-teal" />
          <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
        </div>
        <div className="text-center py-8">
          <p className="text-brand-gray">No FAQs available for this product yet.</p>
        </div>
      </section>
    )
  }

  const topFAQs = faqs
    .sort((a, b) => a.display_order - b.display_order)
    .slice(0, 5)

  return (
    <section
      className="mt-16 bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
      itemScope
      itemType="https://schema.org/FAQPage"
    >
      <div className="flex items-center mb-6">
        <HelpCircle className="w-6 h-6 mr-3 text-brand-teal" aria-hidden="true" />
        <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
      </div>

      <div className="space-y-4">
        {topFAQs.map((faq) => {
          const isExpanded = expandedItems.has(faq.id)

          return (
            <article
              key={faq.id}
              className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 hover:border-brand-teal/30"
              itemScope
              itemProp="mainEntity"
              itemType="https://schema.org/Question"
            >
              <button
                onClick={() => toggleExpanded(faq.id)}
                className="w-full px-6 py-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between group"
                aria-expanded={isExpanded}
                aria-controls={`faq-answer-${faq.id}`}
              >
                <span
                  className="font-semibold text-brand-dark group-hover:text-brand-teal transition-colors"
                  itemProp="name"
                >
                  {faq.question}
                </span>
                <div className="ml-4 flex-shrink-0" aria-hidden="true">
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-brand-gray group-hover:text-brand-teal transition-colors" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-brand-gray group-hover:text-brand-teal transition-colors" />
                  )}
                </div>
              </button>

              <div
                id={`faq-answer-${faq.id}`}
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
                itemScope
                itemProp="acceptedAnswer"
                itemType="https://schema.org/Answer"
              >
                <div className="px-6 py-4 bg-white border-t border-gray-100">
                  <div
                    className="prose prose-sm max-w-none text-brand-gray leading-relaxed"
                    itemProp="text"
                  >
                    {faq.answer.split('\n').map((paragraph, index) => (
                      <p key={index} className={index > 0 ? 'mt-3' : ''}>
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {faqs.length > 5 && (
        <div className="mt-6 text-center">
          <p className="text-sm text-brand-gray">
            Showing top 5 questions. More questions coming soon!
          </p>
        </div>
      )}
    </section>
  )
}