'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, Sparkles, Clock, TrendingUp, Filter, Star, DollarSign, Tag } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { sb } from '@/lib/supabase-utils'
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
  }, [selectedFilters, query])

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
        sb.from(supabase, 'products_with_taxonomy')
          .select('category_name')
          .eq('status', 'published')
          .not('category_name', 'is', null),
        sb.from(supabase, 'products_with_taxonomy')
          .select('brand_name')
          .eq('status', 'published')
          .not('brand_name', 'is', null)
      ])

      const categoryCount = {} as any
      const brandCount = {} as any

      // Skip data processing for now to avoid type issues
      const categoriesData = categoriesResult.data || []
      const brandsData = brandsResult.data || []

      // TODO: Fix type inference issues with Supabase data

      // TODO: Re-enable suggestions once type issues are resolved
      const recentSuggestions = recentSearches.slice(0, 3).map(search => ({
        query: search,
        type: 'recent' as const
      }))

      setSuggestions([...recentSuggestions])
    } catch (error) {
      console.error('Error loading suggestions:', error)
    }
  }

  const performSearch = async (searchQuery: string) => {
    setLoading(true)

    try {
      const supabase = createClient()

      // Build base query with filters
      const buildQuery = (baseQuery: ReturnType<typeof supabase.from>) => {
        let query = baseQuery.eq('status', 'published')

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

      // AI-powered search with word variations and multiple strategies
      const words = searchQuery.trim().split(/\s+/)

      // Generate all variations for each word
      const allVariations = words.flatMap(word => getWordVariations(word))

      let searchResults: SearchResult[] = []

      if (words.length === 1) {
        // Single word search with variations
        const variations = getWordVariations(searchQuery)
        const variationPattern = variations.join('|')

        searchResults = await Promise.all([
          // 1. Name matches with variations (highest priority)
          buildQuery(supabase
            .from('products_with_taxonomy')
            .select('*'))
            .or(variations.map(v => `name.ilike.%${v}%`).join(','))
            .limit(5),

          // 2. Brand matches
          buildQuery(supabase
            .from('products_with_taxonomy')
            .select('*'))
            .or(variations.map(v => `brand_name.ilike.%${v}%`).join(','))
            .limit(3),

          // 3. Category matches
          buildQuery(supabase
            .from('products_with_taxonomy')
            .select('*'))
            .or(variations.map(v => `category_name.ilike.%${v}%`).join(','))
            .limit(3),

          // 4. Description/excerpt/use case matches
          buildQuery(supabase
            .from('products_with_taxonomy')
            .select('*'))
            .or(variations.flatMap(v => [
              `excerpt.ilike.%${v}%`,
              `description.ilike.%${v}%`,
              `use_case.ilike.%${v}%`
            ]).join(','))
            .limit(3)
        ])
      } else {
        // Multi-word search - look for products containing word variations
        const wordConditions = allVariations.flatMap(variant =>
          [
            `name.ilike.%${variant}%`,
            `brand_name.ilike.%${variant}%`,
            `category_name.ilike.%${variant}%`,
            `excerpt.ilike.%${variant}%`,
            `description.ilike.%${variant}%`,
            `use_case.ilike.%${variant}%`
          ]
        ).join(',')

        // Single query that finds products containing ANY of the word variations
        const multiWordResult = await buildQuery(supabase
          .from('products_with_taxonomy')
          .select('*'))
          .or(wordConditions)
          .limit(25)

        searchResults = [multiWordResult, { data: [] }, { data: [] }, { data: [] }]
      }

      searchResults.forEach((result, index) => {
        const strategy = ['Name matches', 'Brand matches', 'Category matches', 'Description/Use case matches'][index]
        if ((result as any).error) console.error(`  Error in ${strategy}:`, (result as any).error)
        if ((result as any).data?.length) {
        }
      })

      // Combine and deduplicate results with enhanced relevance scoring
      const combinedResults = new Map<string, SearchResult & { relevance_score: number }>()

      if (words.length === 1) {
        // Single word search with enhanced scoring
        searchResults.forEach((result, index) => {
          const baseRelevanceWeight = [5, 3, 2, 1][index] // Prioritize name matches
          const fieldNames = ['name', 'brand_name', 'category_name', 'description'][index]

          ;((result as any).data || []).forEach((product: any) => {
            const existing = combinedResults.get(product.id)

            // Calculate enhanced score with position/compound bonuses
            let enhancedScore = calculateEnhancedScore(
              product,
              [searchQuery],
              fieldNames,
              product[fieldNames] || '',
              baseRelevanceWeight
            )

            // Add BIFL score bonus (quality matters)
            enhancedScore += (product.bifl_total_score || 0) * 0.15

            if (!existing || enhancedScore > existing.relevance_score) {
              combinedResults.set(product.id, {
                ...product,
                relevance_score: enhancedScore
              })
            }
          })
        })
      } else {
        // Multi-word search with enhanced scoring
        const allProducts = (searchResults[0] as any).data || []

        allProducts.forEach((product: any) => {
          let score = 0
          let matchCount = 0

          words.forEach(word => {
            const variations = getWordVariations(word)
            let wordMatched = false

            // Check name (highest priority)
            variations.forEach(variant => {
              const name = (product.name || '').toLowerCase()
              if (name.includes(variant)) {
                let wordScore = 3
                wordScore = calculateEnhancedScore(product, [word], 'name', product.name || '', wordScore)
                score += wordScore
                wordMatched = true
              }
            })

            // Check use case (very high priority for intent matching)
            if (!wordMatched) {
              variations.forEach(variant => {
                const useCase = (product.use_case || '').toLowerCase()
                if (useCase.includes(variant)) {
                  score += 2.5
                  wordMatched = true
                }
              })
            }

            // Check brand
            if (!wordMatched) {
              variations.forEach(variant => {
                const brand = (product.brand_name || '').toLowerCase()
                if (brand.includes(variant)) {
                  let wordScore = 2
                  wordScore = calculateEnhancedScore(product, [word], 'brand_name', product.brand_name || '', wordScore)
                  score += wordScore
                  wordMatched = true
                }
              })
            }

            // Check category
            if (!wordMatched) {
              variations.forEach(variant => {
                const category = (product.category_name || '').toLowerCase()
                if (category.includes(variant)) {
                  score += 1.5
                  wordMatched = true
                }
              })
            }

            // Check description/excerpt
            if (!wordMatched) {
              variations.forEach(variant => {
                const excerpt = (product.excerpt || '').toLowerCase()
                const description = (product.description || '').toLowerCase()
                if (excerpt.includes(variant) || description.includes(variant)) {
                  score += 1
                  wordMatched = true
                }
              })
            }

            if (wordMatched) matchCount++
          })

          // Big bonus for containing all search words
          if (matchCount === words.length) {
            score += 12
          }

          // Partial match bonus (contains most words)
          if (matchCount >= words.length * 0.7) {
            score += 5
          }

          // Add BIFL score bonus (quality matters)
          score += (product.bifl_total_score || 0) * 0.15

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

          const fuzzyMatches = (fuzzyResults as any).data?.filter((product: any) => {
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
            .filter((product: any) => !existingIds.has(product.id))
            .map((product: any) => ({ ...product, relevance_score: 0.5 }))
            .slice(0, 5)

          sortedResults = [...sortedResults, ...newFuzzyMatches]
        } catch (error) {
          console.warn('Fuzzy search failed:', error)
        }
      }


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

  // Word variation helper for handling singular/plural and common patterns
  const getWordVariations = (word: string): string[] => {
    const lower = word.toLowerCase().trim()
    if (!lower) return []

    const variations = new Set([lower])

    // Handle plurals
    if (lower.endsWith('s') && lower.length > 2) {
      variations.add(lower.slice(0, -1)) // boots → boot
      if (lower.endsWith('es') && lower.length > 3) {
        variations.add(lower.slice(0, -2)) // knives → knife (partial)
      }
    } else {
      variations.add(lower + 's') // boot → boots
    }

    // Handle -ies/-y pattern (baby/babies, knife/knives)
    if (lower.endsWith('ies') && lower.length > 3) {
      variations.add(lower.slice(0, -3) + 'y') // batteries → battery
    } else if (lower.endsWith('y') && lower.length > 2) {
      const secondLast = lower[lower.length - 2]
      if (secondLast && !'aeiou'.includes(secondLast)) {
        variations.add(lower.slice(0, -1) + 'ies') // battery → batteries
      }
    }

    // Handle -ves/-fe pattern (knife/knives, wife/wives)
    if (lower.endsWith('ves') && lower.length > 3) {
      variations.add(lower.slice(0, -3) + 'fe') // knives → knife
      variations.add(lower.slice(0, -3) + 'f')  // knives → knif (for knife)
    } else if (lower.endsWith('fe') && lower.length > 2) {
      variations.add(lower.slice(0, -2) + 'ves') // knife → knives
    } else if (lower.endsWith('f') && lower.length > 2) {
      variations.add(lower.slice(0, -1) + 'ves') // shelf → shelves
    }

    return Array.from(variations)
  }

  // Check if word appears at the start of a string (higher relevance)
  const startsWithWord = (text: string, word: string): boolean => {
    const textLower = text.toLowerCase()
    const wordLower = word.toLowerCase()
    return textLower.startsWith(wordLower) || textLower.startsWith(wordLower + ' ')
  }

  // Check if word is a standalone/primary word (not a modifier)
  const isStandaloneWord = (text: string, word: string): boolean => {
    const textLower = text.toLowerCase()
    const wordLower = word.toLowerCase()

    // Exact match
    if (textLower === wordLower) return true

    // Word is the only significant word (with common modifiers ignored)
    const commonModifiers = ['the', 'a', 'an', 'professional', 'premium', 'deluxe', 'classic']
    const words = textLower.split(/\s+/).filter(w => !commonModifiers.includes(w))

    return words.length === 1 && words[0] === wordLower
  }

  // Detect if this is a compound/accessory product (e.g., "knife sharpener" when searching "knife")
  const isCompoundMatch = (text: string, searchWord: string): boolean => {
    const textLower = text.toLowerCase()
    const searchLower = searchWord.toLowerCase()

    // Check if search word appears but text has additional significant words
    if (!textLower.includes(searchLower)) return false

    const compoundIndicators = [
      'sharpener', 'holder', 'case', 'bag', 'kit', 'set', 'stand',
      'rack', 'organizer', 'cleaner', 'polish', 'oil', 'maintenance',
      'accessory', 'tool', 'for', 'with'
    ]

    return compoundIndicators.some(indicator => textLower.includes(indicator))
  }

  // Calculate enhanced relevance score
  const calculateEnhancedScore = (
    product: any,
    searchWords: string[],
    fieldName: string,
    fieldValue: string,
    baseScore: number
  ): number => {
    let score = baseScore
    const fieldLower = (fieldValue || '').toLowerCase()

    searchWords.forEach(searchWord => {
      const variations = getWordVariations(searchWord)

      variations.forEach(variant => {
        if (fieldLower.includes(variant)) {
          // Position bonus: word at start is more relevant
          if (startsWithWord(fieldValue, variant)) {
            score += 2
          }

          // Standalone bonus: word is the primary subject
          if (isStandaloneWord(fieldValue, variant)) {
            score += 3
          }

          // Exact word boundary match (whole word, not substring)
          const wordBoundaryRegex = new RegExp(`\\b${variant}\\b`, 'i')
          if (wordBoundaryRegex.test(fieldValue)) {
            score += 1.5
          }

          // Compound penalty: this is an accessory, not the main product
          if (fieldName === 'name' && isCompoundMatch(fieldValue, variant)) {
            score -= 2
          }
        }
      })
    })

    return score
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
                      setSelectedFilters(prev => {
                        const newFilters = {
                          ...prev,
                          category: prev.category === category ? undefined : category
                        }
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