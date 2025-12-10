'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { BookOpen } from 'lucide-react'

interface Guide {
  id: string
  title: string
  slug: string
  meta_description: string | null
  featured_image_url: string | null
}

interface RelatedGuidesProps {
  categoryId?: string
  categoryName?: string
}

export function RelatedGuides({ categoryId, categoryName }: RelatedGuidesProps) {
  const [guides, setGuides] = useState<Guide[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRelatedGuides() {
      try {
        const supabase = createClient()

        let query = supabase
          .from('buying_guides')
          .select('id, title, slug, meta_description, featured_image_url')
          .eq('is_published', true)
          .order('created_at', { ascending: false })
          .limit(3)

        // If we have a category, try to find guides for that category first
        if (categoryId) {
          query = query.eq('category_id', categoryId)
        }

        const { data, error } = await query

        if (error) throw error

        // If no guides found for category, get any guides
        if ((!data || data.length === 0) && categoryId) {
          const { data: anyGuides, error: anyError } = await supabase
            .from('buying_guides')
            .select('id, title, slug, meta_description, featured_image_url')
            .eq('is_published', true)
            .order('created_at', { ascending: false })
            .limit(3)

          if (!anyError && anyGuides) {
            setGuides(anyGuides)
          }
        } else {
          setGuides(data || [])
        }
      } catch (error) {
        console.error('Error fetching related guides:', error)
        setGuides([])
      } finally {
        setLoading(false)
      }
    }

    fetchRelatedGuides()
  }, [categoryId])

  if (loading || guides.length === 0) {
    return null
  }

  return (
    <section className="mt-12 pt-8 border-t border-gray-200">
      <div className="flex items-center gap-2 mb-6">
        <BookOpen className="w-5 h-5 text-brand-teal" />
        <h2 className="text-2xl font-bold text-brand-dark">
          {categoryName ? `${categoryName} Buying Guides` : 'Related Buying Guides'}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {guides.map((guide) => (
          <Link
            key={guide.id}
            href={`/guides/${guide.slug}`}
            className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
          >
            {guide.featured_image_url && (
              <div className="relative h-40 bg-gray-100">
                <Image
                  src={guide.featured_image_url}
                  alt={guide.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            <div className="p-4">
              <h3 className="font-semibold text-brand-dark group-hover:text-brand-teal transition-colors line-clamp-2">
                {guide.title}
              </h3>
              {guide.meta_description && (
                <p className="text-sm text-brand-gray mt-2 line-clamp-2">
                  {guide.meta_description}
                </p>
              )}
              <span className="inline-block mt-3 text-sm font-medium text-brand-teal">
                Read Guide →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
