'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
}

interface RelatedCategoriesProps {
  currentCategoryId: string
  currentCategorySlug: string
}

export function RelatedCategories({ currentCategoryId, currentCategorySlug }: RelatedCategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRelatedCategories() {
      try {
        const supabase = createClient()

        // Get other categories excluding the current one
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, slug, description')
          .neq('id', currentCategoryId)
          .order('name')
          .limit(8)

        if (error) throw error
        setCategories(data || [])
      } catch (error) {
        console.error('Error fetching related categories:', error)
        setCategories([])
      } finally {
        setLoading(false)
      }
    }

    fetchRelatedCategories()
  }, [currentCategoryId])

  if (loading || categories.length === 0) {
    return null
  }

  return (
    <section className="mt-12 pt-8 border-t border-gray-200">
      <h2 className="text-xl font-semibold text-brand-dark mb-4">Explore Other Categories</h2>
      <div className="flex flex-wrap gap-3">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-brand-teal hover:bg-brand-teal/5 transition-all text-sm font-medium text-brand-dark hover:text-brand-teal"
          >
            {category.name}
          </Link>
        ))}
      </div>
    </section>
  )
}
