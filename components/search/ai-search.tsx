'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, Sparkles, Clock, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'

interface SearchResult {
  id: string
  name: string
  slug: string
  brand_name: string
  featured_image_url: string | null
  bifl_total_score: number | null
  price: number | null
  excerpt: string | null
  category_name: string | null
  relevance_score?: number
}

interface SearchSuggestion {
  query: string
  type: 'recent' | 'trending' | 'category' | 'brand'
  count?: number
}

export function AISearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('bifl-recent-searches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }

    // Load trending searches and suggestions
    loadSuggestions()
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  useEffect(() => {
    if (query.length > 2) {
      const debounceTimer = setTimeout(() => {
        performSearch(query)
      }, 300)
      return () => clearTimeout(debounceTimer)
    } else {
      setResults([])
    }
  }, [query])

  const loadSuggestions = async () => {
    try {
      const supabase = createClient()

      // Get trending categories and brands
      const [categoriesResult, brandsResult] = await Promise.all([
        supabase
          .from('products_with_taxonomy')
          .select('category_name')
          .eq('status', 'published')
          .not('category_name', 'is', null),
        supabase
          .from('products_with_taxonomy')
          .select('brand_name')
          .eq('status', 'published')
          .not('brand_name', 'is', null)
      ])

      const categoryCount: Record<string, number> = {}
      const brandCount: Record<string, number> = {}

      categoriesResult.data?.forEach(item => {
        if (item.category_name) {
          categoryCount[item.category_name] = (categoryCount[item.category_name] || 0) + 1
        }
      })

      brandsResult.data?.forEach(item => {
        if (item.brand_name) {
          brandCount[item.brand_name] = (brandCount[item.brand_name] || 0) + 1
        }
      })

      const topCategories = Object.entries(categoryCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([name, count]) => ({ query: name, type: 'category' as const, count }))

      const topBrands = Object.entries(brandCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([name, count]) => ({ query: name, type: 'brand' as const, count }))

      const recentSuggestions = recentSearches.slice(0, 3).map(search => ({
        query: search,
        type: 'recent' as const
      }))

      setSuggestions([...recentSuggestions, ...topCategories, ...topBrands])
    } catch (error) {
      console.error('Error loading suggestions:', error)
    }
  }

  const performSearch = async (searchQuery: string) => {
    setLoading(true)
    try {
      const supabase = createClient()

      // AI-powered search with multiple strategies
      const searchResults = await Promise.all([
        // 1. Exact name matches (highest priority)
        supabase
          .from('products_with_taxonomy')
          .select('*')
          .eq('status', 'published')
          .ilike('name', `%${searchQuery}%`)
          .limit(3),

        // 2. Brand matches
        supabase
          .from('products_with_taxonomy')
          .select('*')
          .eq('status', 'published')
          .ilike('brand_name', `%${searchQuery}%`)
          .limit(3),

        // 3. Category matches
        supabase
          .from('products_with_taxonomy')
          .select('*')
          .eq('status', 'published')
          .ilike('category_name', `%${searchQuery}%`)
          .limit(3),

        // 4. Description/excerpt matches
        supabase
          .from('products_with_taxonomy')
          .select('*')
          .eq('status', 'published')
          .or(`excerpt.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
          .limit(3)
      ])

      // Combine and deduplicate results with relevance scoring
      const combinedResults = new Map<string, SearchResult & { relevance_score: number }>()

      searchResults.forEach((result, index) => {
        const relevanceWeight = [4, 3, 2, 1][index] // Prioritize exact name matches
        result.data?.forEach(product => {
          const existing = combinedResults.get(product.id)
          const newScore = relevanceWeight + (product.bifl_total_score || 0) * 0.1

          if (!existing || newScore > existing.relevance_score) {
            combinedResults.set(product.id, {
              ...product,
              relevance_score: newScore
            })
          }
        })
      })

      // Sort by relevance and BIFL score
      const sortedResults = Array.from(combinedResults.values())
        .sort((a, b) => b.relevance_score - a.relevance_score)
        .slice(0, 8)

      setResults(sortedResults)

      // Save to recent searches
      if (searchQuery.length > 2) {
        const updatedRecent = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 10)
        setRecentSearches(updatedRecent)
        localStorage.setItem('bifl-recent-searches', JSON.stringify(updatedRecent))
      }
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    performSearch(suggestion)
    inputRef.current?.focus()
  }

  const clearQuery = () => {
    setQuery('')
    setResults([])
    inputRef.current?.focus()
  }

  const getScoreBadge = (score: number | null) => {
    if (!score) return null

    let bgColor = 'bg-gray-400'
    if (score >= 9.0) bgColor = 'bg-green-500'
    else if (score >= 8.0) bgColor = 'bg-yellow-500'
    else if (score >= 7.0) bgColor = 'bg-orange-500'
    else if (score >= 6.0) bgColor = 'bg-red-500'

    return (
      <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold text-white ${bgColor}`}>
        {score.toFixed(1)}
      </span>
    )
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-gray w-5 h-5" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Search for durable products... (e.g., 'kitchen knives', 'leather boots')"
          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-brand-teal"
        />
        {query && (
          <button
            onClick={clearQuery}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-brand-gray hover:text-brand-dark"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {query.length === 0 ? (
            /* Search Suggestions */
            <div className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Sparkles className="w-4 h-4 text-brand-teal" />
                <span className="text-sm font-medium text-brand-dark">Search Suggestions</span>
              </div>

              {suggestions.length > 0 ? (
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion.query)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        {suggestion.type === 'recent' && <Clock className="w-4 h-4 text-brand-gray" />}
                        {suggestion.type === 'trending' && <TrendingUp className="w-4 h-4 text-brand-teal" />}
                        {suggestion.type === 'category' && <span className="w-4 h-4 text-xs bg-blue-100 text-blue-600 rounded flex items-center justify-center font-bold">C</span>}
                        {suggestion.type === 'brand' && <span className="w-4 h-4 text-xs bg-purple-100 text-purple-600 rounded flex items-center justify-center font-bold">B</span>}
                        <span className="text-sm text-brand-dark">{suggestion.query}</span>
                      </div>
                      {suggestion.count && (
                        <span className="text-xs text-brand-gray">{suggestion.count} products</span>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-brand-gray">Start typing to search...</p>
              )}
            </div>
          ) : loading ? (
            /* Loading State */
            <div className="p-8 text-center">
              <div className="w-6 h-6 animate-spin rounded-full border-2 border-brand-teal border-t-transparent mx-auto mb-2"></div>
              <p className="text-sm text-brand-gray">Searching...</p>
            </div>
          ) : results.length > 0 ? (
            /* Search Results */
            <div className="p-2">
              <div className="px-2 py-1 mb-2">
                <span className="text-xs font-medium text-brand-gray">
                  {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
                </span>
              </div>
              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  onClick={() => setIsOpen(false)}
                  className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex space-x-3">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {product.featured_image_url ? (
                        <Image
                          src={product.featured_image_url}
                          alt={product.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-xs text-gray-500">No Image</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-brand-gray mb-1">
                            {product.brand_name} • {product.category_name}
                          </p>
                          <p className="font-medium text-brand-dark text-sm line-clamp-1">
                            {product.name}
                          </p>
                          {product.excerpt && (
                            <p className="text-xs text-brand-gray mt-1 line-clamp-2">
                              {product.excerpt}
                            </p>
                          )}
                        </div>

                        <div className="ml-2 flex-shrink-0 flex items-center space-x-2">
                          {product.bifl_total_score && getScoreBadge(product.bifl_total_score)}
                          {product.price && (
                            <span className="text-sm font-medium text-brand-dark">
                              ${product.price}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}

              <div className="px-2 py-3 border-t border-gray-100 mt-2">
                <Link
                  href={`/products?search=${encodeURIComponent(query)}`}
                  onClick={() => setIsOpen(false)}
                  className="text-sm text-brand-teal hover:text-opacity-80 font-medium"
                >
                  View all results for "{query}" →
                </Link>
              </div>
            </div>
          ) : query.length > 2 ? (
            /* No Results */
            <div className="p-8 text-center">
              <p className="text-sm text-brand-gray mb-2">No products found for "{query}"</p>
              <p className="text-xs text-brand-gray">
                Try searching for brand names, categories, or product types
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}