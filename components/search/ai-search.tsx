'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, Sparkles, Clock, TrendingUp, Filter, Star, DollarSign, Tag } from 'lucide-react'
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
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [selectedFilters, setSelectedFilters] = useState<{
    category?: string
    priceRange?: string
    scoreRange?: string
  }>({})
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
  }, []) // loadSuggestions should be wrapped in useCallback

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
    setSelectedIndex(-1) // Reset selection when query changes
  }, [query])

  // Re-search when filters change
  useEffect(() => {
    if (query.length > 2) {
      performSearch(query)
    }
  }, [selectedFilters, query, performSearch])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      const allItems = query.length === 0 ? suggestions : results
      const maxIndex = allItems.length - 1

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => prev < maxIndex ? prev + 1 : prev)
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => prev > 0 ? prev - 1 : prev)
          break
        case 'Enter':
          e.preventDefault()
          if (selectedIndex >= 0) {
            if (query.length === 0 && suggestions[selectedIndex]) {
              // Select suggestion
              handleSuggestionClick(suggestions[selectedIndex].query)
            } else if (results[selectedIndex]) {
              // Navigate to product
              window.location.href = `/products/${results[selectedIndex].id}`
              setIsOpen(false)
            }
          } else if (query.length > 2) {
            // Navigate to full search results
            window.location.href = `/products?search=${encodeURIComponent(query)}`
            setIsOpen(false)
          }
          break
        case 'Escape':
          e.preventDefault()
          setIsOpen(false)
          setSelectedIndex(-1)
          inputRef.current?.blur()
          break
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, selectedIndex, suggestions, results, query])

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
    console.log('🔍 Starting search for:', searchQuery)
    console.log('🎯 Active filters:', selectedFilters)

    try {
      const supabase = createClient()

      // Build base query with filters
      const buildQuery = (baseQuery: ReturnType<typeof supabase.from>) => {
        let query = baseQuery.eq('status', 'published')
        console.log('📊 Building query with base filters')

        if (selectedFilters.category) {
          query = query.eq('category_name', selectedFilters.category)
        }

        if (selectedFilters.scoreRange) {
          const [min, max] = selectedFilters.scoreRange.split('-').map(Number)
          if (max) {
            query = query.gte('bifl_total_score', min).lte('bifl_total_score', max)
          } else {
            query = query.gte('bifl_total_score', min)
          }
        }

        if (selectedFilters.priceRange) {
          const [min, max] = selectedFilters.priceRange.split('-').map(Number)
          if (max) {
            query = query.gte('price', min).lte('price', max)
          } else {
            query = query.gte('price', min)
          }
        }

        return query
      }

      // AI-powered search with multiple strategies - improved for multi-word searches
      console.log('🚀 Executing search queries...')
      const words = searchQuery.trim().split(/\s+/)

      let searchResults: SearchResult[] = []

      if (words.length === 1) {
        // Single word search - use existing logic
        searchResults = await Promise.all([
          // 1. Exact name matches (highest priority)
          buildQuery(supabase
            .from('products_with_taxonomy')
            .select('*'))
            .ilike('name', `%${searchQuery}%`)
            .limit(3),

          // 2. Brand matches
          buildQuery(supabase
            .from('products_with_taxonomy')
            .select('*'))
            .ilike('brand_name', `%${searchQuery}%`)
            .limit(3),

          // 3. Category matches
          buildQuery(supabase
            .from('products_with_taxonomy')
            .select('*'))
            .ilike('category_name', `%${searchQuery}%`)
            .limit(3),

          // 4. Description/excerpt/use case matches
          buildQuery(supabase
            .from('products_with_taxonomy')
            .select('*'))
            .or(`excerpt.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,use_case.ilike.%${searchQuery}%`)
            .limit(3)
        ])
      } else {
        // Multi-word search - look for products containing individual words
        const wordConditions = words.map(word =>
          `name.ilike.%${word}%,brand_name.ilike.%${word}%,category_name.ilike.%${word}%,excerpt.ilike.%${word}%,description.ilike.%${word}%,use_case.ilike.%${word}%`
        ).join(',')

        // Single query that finds products containing ANY of the words
        const multiWordResult = await buildQuery(supabase
          .from('products_with_taxonomy')
          .select('*'))
          .or(wordConditions)
          .limit(20)

        searchResults = [multiWordResult, { data: [] }, { data: [] }, { data: [] }]
      }

      console.log('📋 Search results by strategy:')
      searchResults.forEach((result, index) => {
        const strategy = ['Name matches', 'Brand matches', 'Category matches', 'Description/Use case matches'][index]
        console.log(`  ${strategy}:`, result.data?.length || 0, 'results')
        if (result.error) console.error(`  Error in ${strategy}:`, result.error)
        if (result.data?.length) {
          console.log(`  First result:`, result.data[0]?.name)
        }
      })

      // Combine and deduplicate results with relevance scoring
      const combinedResults = new Map<string, SearchResult & { relevance_score: number }>()

      if (words.length === 1) {
        // Single word search - use existing relevance logic
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
      } else {
        // Multi-word search - calculate relevance based on word matches
        const allProducts = searchResults[0].data || []

        allProducts.forEach(product => {
          let score = 0
          let matchCount = 0

          words.forEach(word => {
            const wordLower = word.toLowerCase()
            const name = (product.name || '').toLowerCase()
            const brand = (product.brand_name || '').toLowerCase()
            const category = (product.category_name || '').toLowerCase()
            const excerpt = (product.excerpt || '').toLowerCase()
            const description = (product.description || '').toLowerCase()
            const useCase = (product.use_case || '').toLowerCase()

            if (name.includes(wordLower)) {
              score += 3 // Name match most important
              matchCount++
            } else if (brand.includes(wordLower)) {
              score += 2 // Brand match second
              matchCount++
            } else if (useCase.includes(wordLower)) {
              score += 2.5 // Use case match high priority
              matchCount++
            } else if (category.includes(wordLower)) {
              score += 1.5 // Category match third
              matchCount++
            } else if (excerpt.includes(wordLower) || description.includes(wordLower)) {
              score += 1 // Description match least important
              matchCount++
            }
          })

          // Bonus for containing all words
          if (matchCount === words.length) {
            score += 10
          }

          // Add BIFL score bonus
          score += (product.bifl_total_score || 0) * 0.1

          // Only include products with sufficient relevance
          if (score >= 2) {
            combinedResults.set(product.id, {
              ...product,
              relevance_score: score
            })
          }
        })
      }

      // Sort by relevance and BIFL score
      let sortedResults = Array.from(combinedResults.values())
        .sort((a, b) => b.relevance_score - a.relevance_score)
        .slice(0, 8)

      // If we have few results, try fuzzy matching for typos
      if (sortedResults.length < 3 && searchQuery.length > 3) {
        try {
          const fuzzyResults = await buildQuery(supabase
            .from('products_with_taxonomy')
            .select('*'))
            .limit(20)

          const fuzzyMatches = fuzzyResults.data?.filter(product => {
            const searchTerms = searchQuery.split(' ')
            return searchTerms.some(term =>
              fuzzyMatch(term, product.name || '') ||
              fuzzyMatch(term, product.brand_name || '') ||
              fuzzyMatch(term, product.category_name || '') ||
              fuzzyMatch(term, product.use_case || '')
            )
          }) || []

          // Add fuzzy matches that aren't already in results
          const existingIds = new Set(sortedResults.map(r => r.id))
          const newFuzzyMatches = fuzzyMatches
            .filter(product => !existingIds.has(product.id))
            .map(product => ({ ...product, relevance_score: 0.5 }))
            .slice(0, 5)

          sortedResults = [...sortedResults, ...newFuzzyMatches]
        } catch (error) {
          console.warn('Fuzzy search failed:', error)
        }
      }

      console.log('✅ Final results:', sortedResults.length, 'products')
      console.log('📦 Product names:', sortedResults.map(p => p.name))

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
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }

  const clearQuery = () => {
    setQuery('')
    setResults([])
    setSelectedIndex(-1)
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

  const highlightText = (text: string, searchQuery: string) => {
    if (!searchQuery || !text) return text

    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'))
    return parts.map((part, index) =>
      part.toLowerCase() === searchQuery.toLowerCase() ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded text-brand-dark font-medium">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  // Simple fuzzy matching for typos (Levenshtein distance)
  const fuzzyMatch = (str1: string, str2: string, threshold: number = 2): boolean => {
    const s1 = str1.toLowerCase()
    const s2 = str2.toLowerCase()

    if (Math.abs(s1.length - s2.length) > threshold) return false

    const matrix = Array(s2.length + 1).fill(null).map(() => Array(s1.length + 1).fill(null))

    for (let i = 0; i <= s1.length; i++) matrix[0][i] = i
    for (let j = 0; j <= s2.length; j++) matrix[j][0] = j

    for (let j = 1; j <= s2.length; j++) {
      for (let i = 1; i <= s1.length; i++) {
        const cost = s1[i - 1] === s2[j - 1] ? 0 : 1
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + cost
        )
      }
    }

    return matrix[s2.length][s1.length] <= threshold
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
          placeholder="Search for durable products... (e.g., 'kitchen knives', 'hiking boots', 'professional use')"
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
          {/* Quick Filters */}
          {query.length > 0 && (
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center space-x-2 mb-2">
                <Filter className="w-4 h-4 text-brand-teal" />
                <span className="text-xs font-medium text-brand-dark">Quick Filters</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {/* Category Filters */}
                {['Kitchen', 'Clothing', 'Electronics', 'Tools'].map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      console.log('🏷️ Category filter clicked:', category)
                      setSelectedFilters(prev => {
                        const newFilters = {
                          ...prev,
                          category: prev.category === category ? undefined : category
                        }
                        console.log('🏷️ New filters after category click:', newFilters)
                        return newFilters
                      })
                    }}
                    className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs transition-colors ${
                      selectedFilters.category === category
                        ? 'bg-brand-teal text-white'
                        : 'bg-gray-100 text-brand-gray hover:bg-gray-200'
                    }`}
                  >
                    <Tag className="w-3 h-3" />
                    <span>{category}</span>
                  </button>
                ))}

                {/* Score Filters */}
                {[
                  { label: '9+ Score', value: '9-10' },
                  { label: '8+ Score', value: '8-10' },
                  { label: '7+ Score', value: '7-10' }
                ].map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setSelectedFilters(prev => ({
                      ...prev,
                      scoreRange: prev.scoreRange === filter.value ? undefined : filter.value
                    }))}
                    className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs transition-colors ${
                      selectedFilters.scoreRange === filter.value
                        ? 'bg-brand-teal text-white'
                        : 'bg-gray-100 text-brand-gray hover:bg-gray-200'
                    }`}
                  >
                    <Star className="w-3 h-3" />
                    <span>{filter.label}</span>
                  </button>
                ))}

                {/* Price Filters */}
                {[
                  { label: 'Under $50', value: '0-50' },
                  { label: '$50-200', value: '50-200' },
                  { label: '$200+', value: '200-999999' }
                ].map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setSelectedFilters(prev => ({
                      ...prev,
                      priceRange: prev.priceRange === filter.value ? undefined : filter.value
                    }))}
                    className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs transition-colors ${
                      selectedFilters.priceRange === filter.value
                        ? 'bg-brand-teal text-white'
                        : 'bg-gray-100 text-brand-gray hover:bg-gray-200'
                    }`}
                  >
                    <DollarSign className="w-3 h-3" />
                    <span>{filter.label}</span>
                  </button>
                ))}
              </div>

              {/* Clear Filters */}
              {(selectedFilters.category || selectedFilters.scoreRange || selectedFilters.priceRange) && (
                <button
                  onClick={() => setSelectedFilters({})}
                  className="mt-2 text-xs text-brand-gray hover:text-brand-dark underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}

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
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                        selectedIndex === index ? 'bg-brand-teal bg-opacity-10 border-l-2 border-brand-teal' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        {suggestion.type === 'recent' && <Clock className="w-4 h-4 text-brand-gray" />}
                        {suggestion.type === 'trending' && <TrendingUp className="w-4 h-4 text-brand-teal" />}
                        {suggestion.type === 'category' && <span className="w-4 h-4 text-xs bg-blue-100 text-blue-600 rounded flex items-center justify-center font-bold">C</span>}
                        {suggestion.type === 'brand' && <span className="w-4 h-4 text-xs bg-purple-100 text-purple-600 rounded flex items-center justify-center font-bold">B</span>}
                        <span className="text-sm text-brand-dark">{highlightText(suggestion.query, query)}</span>
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
                  {results.length} result{results.length !== 1 ? 's' : ''} for &quot;{query}&quot;
                </span>
              </div>
              {results.map((product, index) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  onClick={() => setIsOpen(false)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`block p-3 rounded-lg transition-colors ${
                    selectedIndex === index ? 'bg-brand-teal bg-opacity-10 border-l-2 border-brand-teal' : 'hover:bg-gray-50'
                  }`}
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
                            {highlightText(product.brand_name || '', query)} • {highlightText(product.category_name || '', query)}
                          </p>
                          <p className="font-medium text-brand-dark text-sm line-clamp-1">
                            {highlightText(product.name, query)}
                          </p>
                          {product.excerpt && (
                            <p className="text-xs text-brand-gray mt-1 line-clamp-2">
                              {highlightText(product.excerpt, query)}
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
                  View all results for &quot;{query}&quot; →
                </Link>
              </div>
            </div>
          ) : query.length > 2 ? (
            /* No Results */
            <div className="p-8 text-center">
              <p className="text-sm text-brand-gray mb-2">No products found for &quot;{query}&quot;</p>
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