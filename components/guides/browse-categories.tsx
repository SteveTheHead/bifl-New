'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Grid3X3 } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
}

interface BrowseCategoriesProps {
  currentCategoryId?: string
}

export function BrowseCategories({ currentCategoryId }: BrowseCategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCategories() {
      try {
        const supabase = createClient()

        // Get main categories (those without parent_id or top-level ones)
        let query = supabase
          .from('categories')
          .select('id, name, slug')
          .order('name')
          .limit(12)

        // Exclude current category if provided
        if (currentCategoryId) {
          query = query.neq('id', currentCategoryId)
        }

        const { data, error } = await query

        if (error) throw error
        setCategories(data || [])
      } catch (error) {
        console.error('Error fetching categories:', error)
        setCategories([])
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [currentCategoryId])

  if (loading || categories.length === 0) {
    return null
  }

  return (
    <section className="mt-12 pt-8 border-t border-gray-200">
      <div className="flex items-center gap-2 mb-6">
        <Grid3X3 className="w-5 h-5 text-brand-teal" />
        <h2 className="text-2xl font-bold text-brand-dark">Browse by Category</h2>
      </div>

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

      <div className="mt-4">
        <Link
          href="/categories"
          className="text-sm font-medium text-brand-teal hover:text-brand-teal/80 transition-colors"
        >
          View all categories →
        </Link>
      </div>
    </section>
  )
}
