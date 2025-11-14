'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { ChevronDown, Grid3x3 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
}

export function CategoryNav() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchCategories() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, slug, description')
          .is('parent_id', null)
          .not('name', 'is', null)
          .neq('name', '')
          .order('display_order', { ascending: true })

        if (error) {
          console.error('Error fetching categories:', error)
          setCategories([])
        } else {
          setCategories(data || [])
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
        setCategories([])
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  if (loading || categories.length === 0) {
    return null
  }

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center py-2">
          {/* Mobile/Tablet: Categories Dropdown */}
          <div className="lg:hidden relative flex-1" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-all w-full justify-center"
              style={{ backgroundColor: '#4A9D93' }}
            >
              <Grid3x3 className="w-4 h-4" />
              <span>Shop by Category</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
              <div className="absolute left-0 mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                <Link
                  href="/categories"
                  className="block px-4 py-2.5 text-sm font-semibold text-brand-dark hover:bg-gray-100 border-b border-gray-200"
                  onClick={() => setIsOpen(false)}
                >
                  View All Categories
                </Link>
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/products?categories=${category.id}`}
                    className="block px-4 py-2.5 text-sm text-brand-gray hover:text-brand-dark hover:bg-gray-100 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Desktop: Category Links - Single Row (no Categories button) */}
          <div className="hidden lg:flex items-center gap-1 flex-1 justify-start">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?categories=${category.id}`}
                className="px-2 py-1.5 rounded-lg text-xs font-medium text-brand-gray hover:text-brand-dark hover:bg-white/50 transition-all whitespace-nowrap"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
