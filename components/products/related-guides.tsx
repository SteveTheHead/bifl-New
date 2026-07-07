import Link from 'next/link'
import Image from 'next/image'
import { createBuildClient } from '@/lib/supabase/server'
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

/**
 * Server component: buying guides related to a category (falls back to the
 * latest guides when the category has none). Rendered in the page HTML so
 * the internal links carry crawl equity — the old version fetched client-side
 * and was invisible to crawlers.
 */
export async function RelatedGuides({ categoryId, categoryName }: RelatedGuidesProps) {
  const supabase = createBuildClient()

  let guides: Guide[] = []
  try {
    if (categoryId) {
      const { data } = await supabase
        .from('buying_guides')
        .select('id, title, slug, meta_description, featured_image_url')
        .eq('is_published', true)
        .eq('category_id', categoryId)
        .order('created_at', { ascending: false })
        .limit(3)
      guides = data ?? []
    }
    if (guides.length === 0) {
      const { data } = await supabase
        .from('buying_guides')
        .select('id, title, slug, meta_description, featured_image_url')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(3)
      guides = data ?? []
    }
  } catch (error) {
    console.error('Error fetching related guides:', error)
    return null
  }

  if (guides.length === 0) return null

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
                  sizes="(max-width: 768px) 100vw, 33vw"
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
