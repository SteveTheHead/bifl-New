'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { ProductFilters } from './product-filters'
import BadgeDisplay from '@/components/BadgeDisplay'
import { AddToCompareButton } from '@/components/compare/add-to-compare-button'
import { FavoriteButton } from '@/components/favorites/favorite-button'
import { SlidersHorizontal, X } from 'lucide-react'

interface Product {
  id: string
  name: string
  slug: string
  brand_name?: string
  featured_image_url?: string | null
  price?: number | string | null
  bifl_total_score?: number | null
  warranty_score?: number | null
  social_score?: number | null
  repairability_score?: number | null
  sustainability_score?: number | null
  durability_score?: number | null
  affiliate_link?: string | null
  bifl_certification?: string[] | null
}

interface Category {
  id: string
  name: string
  slug: string
}

// Badge calculation function (matching BadgeDisplay logic)
function calculateBadges(product: Product): string[] {
  if (!product) return []

  const badges: string[] = []
  const totalScore = product.bifl_total_score || 0
  const warrantyScore = product.warranty_score || 0
  const socialScore = product.social_score || 0
  const repairabilityScore = product.repairability_score || 0
  const sustainabilityScore = product.sustainability_score || 0
  const buildQualityScore = product.durability_score || 0
  const durabilityScore = product.durability_score || 0

  // Gold Standard: 9.0+ average across all scores with high individual scores
  if (totalScore >= 9.0 &&
      buildQualityScore >= 8.5 &&
      durabilityScore >= 8.5 &&
      warrantyScore >= 8.0) {
    badges.push('Gold Standard')
  }

  // Lifetime Warranty: Warranty score = 10
  if (warrantyScore >= 10.0) {
    badges.push('Lifetime Warranty')
  }

  // Crowd Favorite: Social score ≥ 8.5
  if (socialScore >= 8.5) {
    badges.push('Crowd Favorite')
  }

  // Repair Friendly: Repairability score ≥ 8.5
  if (repairabilityScore >= 8.5) {
    badges.push('Repair Friendly')
  }

  // Eco Hero: Sustainability score ≥ 8.0
  if (sustainabilityScore >= 8.0) {
    badges.push('Eco Hero')
  }

  // BIFL Approved: 7.5+ across all categories (only if no other badges)
  if (badges.length === 0 &&
      totalScore >= 7.5 &&
      buildQualityScore >= 7.0 &&
      durabilityScore >= 7.0 &&
      warrantyScore >= 6.0) {
    badges.push('BIFL Approved')
  }

  return badges
}

function getScoreBadgeStyle(score: number) {
  const scoreString = score.toString()
  return {
    className: "score-field px-3 py-1 rounded-full transform transition-all duration-300",
    dataScore: scoreString
  }
}

// Get score label for accessibility
function getScoreLabel(score: number) {
  if (score >= 9.0) return "Legend"
  if (score >= 8.0) return "Excellent"
  if (score >= 7.0) return "Good"
  if (score >= 6.0) return "Fair"
  return "Poor"
}

// Word variation helper for handling singular/plural
function getWordVariations(word: string): string[] {
  const lower = word.toLowerCase().trim()
  if (!lower) return []

  const variations = new Set([lower])

  // Handle plurals
  if (lower.endsWith('s') && lower.length > 2) {
    variations.add(lower.slice(0, -1)) // boots → boot
    if (lower.endsWith('es') && lower.length > 3) {
      variations.add(lower.slice(0, -2))
    }
  } else {
    variations.add(lower + 's') // boot → boots
  }

  // Handle -ies/-y pattern
  if (lower.endsWith('ies') && lower.length > 3) {
    variations.add(lower.slice(0, -3) + 'y') // batteries → battery
  } else if (lower.endsWith('y') && lower.length > 2) {
    const secondLast = lower[lower.length - 2]
    if (secondLast && !'aeiou'.includes(secondLast)) {
      variations.add(lower.slice(0, -1) + 'ies') // battery → batteries
    }
  }

  // Handle -ves/-fe pattern (knife/knives)
  if (lower.endsWith('ves') && lower.length > 3) {
    variations.add(lower.slice(0, -3) + 'fe') // knives → knife
    variations.add(lower.slice(0, -3) + 'f')
  } else if (lower.endsWith('fe') && lower.length > 2) {
    variations.add(lower.slice(0, -2) + 'ves') // knife → knives
  } else if (lower.endsWith('f') && lower.length > 2) {
    variations.add(lower.slice(0, -1) + 'ves') // shelf → shelves
  }

  return Array.from(variations)
}

// Check if any word variation matches in the text (using word boundaries)
function matchesAnyVariation(text: string, word: string): boolean {
  const textLower = text.toLowerCase()
  const variations = getWordVariations(word)
  return variations.some(variant => {
    // Use word boundary regex to match whole words only
    const regex = new RegExp(`\\b${variant}\\b`, 'i')
    return regex.test(text)
  })
}

// Check if word appears at the start of a string (higher relevance)
function startsWithWord(text: string, word: string): boolean {
  const textLower = text.toLowerCase()
  const wordLower = word.toLowerCase()
  return textLower.startsWith(wordLower) || textLower.startsWith(wordLower + ' ')
}

// Check if word is a standalone/primary word (not a modifier)
function isStandaloneWord(text: string, word: string): boolean {
  const textLower = text.toLowerCase()
  const wordLower = word.toLowerCase()

  if (textLower === wordLower) return true

  const commonModifiers = ['the', 'a', 'an', 'professional', 'premium', 'deluxe', 'classic']
  const words = textLower.split(/\s+/).filter(w => !commonModifiers.includes(w))

  return words.length === 1 && words[0] === wordLower
}

// Detect if this is a compound/accessory product (e.g., "knife sharpener" when searching "knife")
function isCompoundMatch(text: string, searchWord: string): boolean {
  const textLower = text.toLowerCase()
  const searchLower = searchWord.toLowerCase()

  if (!textLower.includes(searchLower)) return false

  const compoundIndicators = [
    'sharpener', 'holder', 'case', 'bag', 'kit', 'set', 'stand',
    'rack', 'organizer', 'cleaner', 'polish', 'oil', 'maintenance',
    'accessory', 'tool', 'for', 'with'
  ]

  return compoundIndicators.some(indicator => textLower.includes(indicator))
}

// Check if an exact phrase appears in text (e.g., "coffee grinder" as exact phrase)
function containsExactPhrase(text: string, words: string[]): boolean {
  if (words.length === 0) return false

  const textLower = text.toLowerCase()
  const phrase = words.join(' ')

  // Check exact phrase with word boundaries
  const regex = new RegExp(`\\b${phrase}\\b`, 'i')
  return regex.test(textLower)
}

// Check if words appear near each other (within 2 words distance)
function hasProximityMatch(text: string, words: string[]): boolean {
  if (words.length < 2) return false

  const textLower = text.toLowerCase()
  const textWords = textLower.split(/\s+/)

  // Find positions of each search word
  const positions: number[][] = words.map(word => {
    const positions: number[] = []
    textWords.forEach((textWord, index) => {
      if (matchesAnyVariation(textWord, word)) {
        positions.push(index)
      }
    })
    return positions
  })

  // Check if any combination of positions is close (within 2 words)
  for (let i = 0; i < words.length - 1; i++) {
    const currentPositions = positions[i]
    const nextPositions = positions[i + 1]

    for (const currentPos of currentPositions) {
      for (const nextPos of nextPositions) {
        if (Math.abs(nextPos - currentPos) <= 2) {
          return true
        }
      }
    }
  }

  return false
}

// Count how many search words appear in a specific field
function countWordsInField(fieldText: string, words: string[]): number {
  let count = 0
  words.forEach(word => {
    if (matchesAnyVariation(fieldText, word)) {
      count++
    }
  })
  return count
}

// Calculate enhanced relevance score
function calculateEnhancedScore(
  product: any,
  searchWords: string[],
  fieldName: string,
  fieldValue: string,
  baseScore: number
): number {
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

// Product card component
function SimpleProductCard({ product }: { product: Product }) {
  const totalScore = product.bifl_total_score || 0

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 text-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
      <Link href={`/products/${product.slug}`} className="relative mb-4 block group/image">
        <Image
          className="w-full h-56 object-contain group-hover/image:scale-105 transition-transform duration-300"
          src={product.featured_image_url || '/placeholder-product.png'}
          alt={product.name || 'Product'}
          width={400}
          height={224}
        />
        <BadgeDisplay
          product={product}
          size="xs"
          overlay={true}
        />
      </Link>
      <h3 className="text-xl font-semibold">{product.name}</h3>
      <p className="text-brand-gray mb-4">{product.brand_name}</p>
      <div className="flex justify-center items-center gap-3 mb-6">
        <span className="text-sm font-medium text-brand-gray">BIFL Score:</span>
        <div
          className={`${getScoreBadgeStyle(totalScore).className} hover:scale-105`}
          data-score={getScoreBadgeStyle(totalScore).dataScore}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold tracking-wide">
              {totalScore.toFixed(1)}
            </span>
            <span className="text-xs font-medium opacity-90">
              {getScoreLabel(totalScore)}
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Link
          href={`/products/${product.slug}`}
          className="w-full text-white font-semibold py-2 px-6 rounded-lg hover:bg-opacity-90 transition-colors cursor-pointer text-center"
          style={{ backgroundColor: '#4A9D93' }}
        >
          View Product
        </Link>
        <div className="flex justify-center items-center gap-2">
          <FavoriteButton
            productId={product.id}
            variant="small"
            className="border border-gray-300 bg-white hover:bg-gray-50"
          />
          <AddToCompareButton
            product={{
              id: product.id,
              name: product.name,
              slug: product.slug,
              price: parseFloat(product.price?.toString() || '0') || 0,
              images: product.featured_image_url ? [product.featured_image_url] : [],
              average_score: product.bifl_total_score ?? undefined,
              affiliate_link: product.affiliate_link ?? undefined
            }}
            size="sm"
            variant="secondary"
          />
        </div>
      </div>
    </div>
  )
}

interface ProductGridProps {
  initialProducts: Product[]
  categories: Category[]
  allCategories?: Category[]
  initialSearch?: string
}

export function ProductGrid({ initialProducts, categories, allCategories, initialSearch = '' }: ProductGridProps) {
  // Mobile filter drawer state
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  // Calculate the actual min and max price from all products
  const priceRange = useMemo(() => {
    const prices = initialProducts
      .map(p => parseFloat(p.price?.toString() || '0'))
      .filter(p => !isNaN(p) && p > 0)
    if (prices.length === 0) return [0, 10000]
    return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))]
  }, [initialProducts])

  const [filters, setFilters] = useState({
    search: initialSearch,
    categories: [] as string[],
    brands: [] as string[],
    badges: [] as string[],
    scoreRanges: [] as string[],
    countries: [] as string[],
    priceRange: priceRange as [number, number],
    sortBy: 'score-desc'
  })

  const [displayCount, setDisplayCount] = useState(48)
  const [pageSize, setPageSize] = useState(48)
  const [resetTrigger, setResetTrigger] = useState(0)

  // Stable callback for filter changes
  const handleFiltersChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters)
  }, [])

  // Callback for mobile drawer that also closes the drawer
  const handleMobileFiltersChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters)
    setIsMobileFilterOpen(false)
  }, [])

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(pageSize)
  }, [filters, pageSize])

  // Filter and sort products based on current filters
  const filteredProducts = useMemo(() => {
    let filtered = [...initialProducts]

    // Search filter - with singular/plural matching and enhanced relevancy scoring
    if (filters.search) {
      const searchTerm = filters.search.trim()
      const words = searchTerm.toLowerCase().split(/\s+/)

      if (words.length === 1) {
        // Single word search with variations and enhanced scoring
        const searchLower = words[0]

        // First filter to only matching products (exclude description to reduce noise)
        filtered = filtered.filter(product => {
          const name = product.name || ''
          const brand = product.brand_name || ''
          const useCase = (product as any).use_case || ''

          return matchesAnyVariation(name, searchLower) ||
                 matchesAnyVariation(brand, searchLower) ||
                 matchesAnyVariation(useCase, searchLower)
        })

        // Then calculate scores for sorting
        filtered.forEach(product => {
          const name = product.name || ''
          const brand = product.brand_name || ''
          const useCase = (product as any).use_case || ''

          let score = 0

          // Base scores for field matches
          if (matchesAnyVariation(name, searchLower)) {
            score += 10
            // Position bonus: word at start is more relevant
            if (startsWithWord(name, searchLower)) {
              score += 5
            }
            // Compound penalty: accessories rank lower
            if (isCompoundMatch(name, searchLower)) {
              score -= 3
            }
          }
          if (matchesAnyVariation(brand, searchLower)) {
            score += 5
          }
          if (matchesAnyVariation(useCase, searchLower)) {
            score += 7
          }

          // Bonus based on BIFL score for relevancy tiebreaker
          score += (product.bifl_total_score || 0) * 0.2

          // Store score for sorting
          ;(product as any)._searchScore = score
        })

        // Sort by relevance score (higher is better)
        filtered.sort((a, b) => ((b as any)._searchScore || 0) - ((a as any)._searchScore || 0))
      } else {
        // Multi-word search with phrase proximity and field concentration scoring
        filtered = filtered.filter(product => {
          const name = product.name || ''
          const brand = product.brand_name || ''
          const useCase = (product as any).use_case || ''

          let score = 0
          let matchCount = 0

          // Count matches per field
          const nameWordCount = countWordsInField(name, words)
          const brandWordCount = countWordsInField(brand, words)
          const useCaseWordCount = countWordsInField(useCase, words)

          // Base scores for each word match
          words.forEach(word => {
            if (matchesAnyVariation(name, word)) {
              score += 10
              matchCount++
              // Position bonus for words at start
              if (startsWithWord(name, word)) {
                score += 3
              }
            }
            if (matchesAnyVariation(brand, word)) {
              score += 5
              matchCount++
            }
            if (matchesAnyVariation(useCase, word)) {
              score += 7
              matchCount++
            }
          })

          // EXACT PHRASE BONUS: Highest priority for exact phrase match
          if (containsExactPhrase(name, words)) {
            score += 30
          } else if (containsExactPhrase(useCase, words)) {
            score += 20
          }

          // PROXIMITY BONUS: Words appear near each other
          if (hasProximityMatch(name, words)) {
            score += 15
          } else if (hasProximityMatch(useCase, words)) {
            score += 10
          }

          // FIELD CONCENTRATION BONUS: All words in same field (especially name)
          if (nameWordCount === words.length) {
            score += 25  // All words in name field
          } else if (useCaseWordCount === words.length) {
            score += 15  // All words in use case
          }

          // Bonus for products containing ALL words (across any fields)
          if (matchCount >= words.length) {
            score += 10
          }

          // BIFL score tiebreaker
          score += (product.bifl_total_score || 0) * 0.1

          // Store score for sorting
          ;(product as any)._searchScore = score

          // Require at least some matches
          return matchCount > 0
        })

        // Sort by relevance score (higher is better)
        filtered.sort((a, b) => {
          const scoreB = (b as any)._searchScore || 0
          const scoreA = (a as any)._searchScore || 0
          return scoreB - scoreA
        })
      }
    }

    // Category filter (include subcategories)
    if (filters.categories && filters.categories.length > 0) {
      // Build a list of all category IDs including subcategories
      const categoryIdsToMatch: string[] = []
      filters.categories.forEach(categoryId => {
        categoryIdsToMatch.push(categoryId)
        // Add all subcategories of this category
        if (allCategories) {
          const subcats = allCategories.filter((cat: any) => cat.parent_id === categoryId)
          subcats.forEach((subcat: any) => categoryIdsToMatch.push(subcat.id))
        }
      })

      filtered = filtered.filter(product => {
        return categoryIdsToMatch.includes((product as any).category_id)
      })
    }

    // Brand filter
    if (filters.brands && filters.brands.length > 0) {
      filtered = filtered.filter(product =>
        filters.brands.includes(product.brand_name || '')
      )
    }

    // Badge filter
    if (filters.badges && filters.badges.length > 0) {
      filtered = filtered.filter(product => {
        const productBadges = product.bifl_certification || calculateBadges(product)
        return filters.badges.some(badge => productBadges.includes(badge))
      })
    }

    // Score range filter
    if (filters.scoreRanges && filters.scoreRanges.length > 0) {
      filtered = filtered.filter(product => {
        const score = product.bifl_total_score || 0
        return filters.scoreRanges.some(range => {
          switch (range) {
            case '9.0-10': return score >= 9.0 && score <= 10
            case '8.0-8.9': return score >= 8.0 && score < 9.0
            case '7.0-7.9': return score >= 7.0 && score < 8.0
            case '6.0-6.9': return score >= 6.0 && score < 7.0
            case '0.0-5.9': return score >= 0.0 && score < 6.0
            default: return false
          }
        })
      })
    }

    // Country filter
    if (filters.countries && filters.countries.length > 0) {
      filtered = filtered.filter(product =>
        filters.countries.includes((product as any).country_of_origin)
      )
    }

    // Price range filter
    // IMPORTANT: Always include products with null/0 prices to avoid hiding products with missing data
    // Bug fix: Previously filtered out 6 products with null prices
    if (filters.priceRange && filters.priceRange.length === 2) {
      filtered = filtered.filter(product => {
        if (!product.price) return true // Include products without prices
        const price = parseFloat(product.price.toString())
        if (isNaN(price) || price === 0) return true // Include products with invalid or zero prices
        return price >= filters.priceRange[0] && price <= filters.priceRange[1]
      })
    }

    // Sort products
    // IMPORTANT: When there's an active search, prioritize search relevancy over sortBy
    const hasActiveSearch = filters.search && filters.search.trim().length > 0

    if (!hasActiveSearch) {
      // No search active - use normal sorting
      filtered.sort((a, b) => {
        switch (filters.sortBy) {
          case 'score-desc':
            return (b.bifl_total_score || 0) - (a.bifl_total_score || 0)
          case 'score-asc':
            return (a.bifl_total_score || 0) - (b.bifl_total_score || 0)
          case 'name-asc':
            return (a.name || '').localeCompare(b.name || '')
          case 'name-desc':
            return (b.name || '').localeCompare(a.name || '')
          case 'newest':
            return new Date((b as any).created_at || 0).getTime() - new Date((a as any).created_at || 0).getTime()
          default:
            return 0
        }
      })
    }
    // If search is active, keep the relevancy sort already applied

    return filtered
  }, [initialProducts, filters])

  // Get products to display based on current display count
  const displayedProducts = filteredProducts.slice(0, displayCount)
  const hasMore = displayCount < filteredProducts.length

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + pageSize)
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    if (newSize === filteredProducts.length) {
      setDisplayCount(filteredProducts.length)
    } else {
      setDisplayCount(newSize)
    }
  }

  return (
    <>
      {/* Mobile Filter Button (FAB) - Only visible on mobile */}
      <button
        onClick={() => setIsMobileFilterOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 bg-brand-teal text-white rounded-full shadow-lg hover:bg-brand-teal/90 transition-all duration-300 hover:scale-110 min-w-[56px] min-h-[56px] flex items-center justify-center gap-2 px-4"
        aria-label="Open filters"
      >
        <SlidersHorizontal className="w-6 h-6" />
        <span className="font-semibold">Filters</span>
      </button>

      {/* Mobile Filter Drawer Overlay */}
      {isMobileFilterOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-50 transition-opacity"
          onClick={() => setIsMobileFilterOpen(false)}
        />
      )}

      {/* Mobile Filter Drawer */}
      <div
        className={`lg:hidden fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isMobileFilterOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-brand-dark">Filters</h2>
          <button
            onClick={() => setIsMobileFilterOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close filters"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-4">
          <ProductFilters
            onFiltersChange={handleMobileFiltersChange}
            categories={categories}
            allCategories={allCategories || categories}
            products={initialProducts}
            currentPriceRange={filters.priceRange}
            resetTrigger={resetTrigger}
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Filters Sidebar - Hidden on mobile, visible on desktop */}
        <div className="hidden lg:block lg:col-span-3">
          <ProductFilters
            onFiltersChange={handleFiltersChange}
            categories={categories}
            allCategories={allCategories || categories}
            products={initialProducts}
            currentPriceRange={filters.priceRange}
            resetTrigger={resetTrigger}
          />
        </div>

        {/* Product Grid Container - Full width on mobile, 9 cols on desktop */}
        <div className="col-span-12 lg:col-span-9">
        {/* Active Filters Indicator */}
        {(() => {
          const hasActiveFilters =
            (filters.search && filters.search !== '') ||
            (filters.categories && filters.categories.length > 0) ||
            (filters.brands && filters.brands.length > 0) ||
            (filters.badges && filters.badges.length > 0) ||
            (filters.scoreRanges && filters.scoreRanges.length > 0) ||
            (filters.countries && filters.countries.length > 0) ||
            (filters.priceRange && priceRange && (filters.priceRange[0] !== priceRange[0] || filters.priceRange[1] !== priceRange[1]))

          return hasActiveFilters ? (
            <div className="mb-4 p-4 bg-teal-50 border-2 border-teal-400 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <p className="text-sm text-gray-900 flex-1">
                <span className="font-semibold">Filters active:</span>
                {filters.search && <span className="ml-2">Search: "{filters.search}"</span>}
                {filters.categories && filters.categories.length > 0 && <span className="ml-2">• {filters.categories.length} {filters.categories.length === 1 ? 'category' : 'categories'}</span>}
                {filters.brands && filters.brands.length > 0 && <span className="ml-2">• {filters.brands.length} {filters.brands.length === 1 ? 'brand' : 'brands'}</span>}
                {filters.badges && filters.badges.length > 0 && <span className="ml-2">• {filters.badges.length} {filters.badges.length === 1 ? 'badge' : 'badges'}</span>}
                {filters.scoreRanges && filters.scoreRanges.length > 0 && <span className="ml-2">• Score filter</span>}
                {filters.countries && filters.countries.length > 0 && <span className="ml-2">• {filters.countries.length} {filters.countries.length === 1 ? 'country' : 'countries'}</span>}
                {filters.priceRange && priceRange && (filters.priceRange[0] !== priceRange[0] || filters.priceRange[1] !== priceRange[1]) && <span className="ml-2">• Price range</span>}
              </p>
              <button
                onClick={() => {
                  setFilters({
                    search: '',
                    categories: [],
                    brands: [],
                    badges: [],
                    scoreRanges: [],
                    countries: [],
                    priceRange: priceRange,
                    sortBy: filters.sortBy || 'score-desc'
                  })
                  setResetTrigger(prev => prev + 1)
                }}
                className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors text-sm font-medium"
              >
                <X className="w-4 h-4 mr-1" />
                Clear All
              </button>
            </div>
          ) : null
        })()}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <p className="text-brand-gray text-sm sm:text-base">
              Showing <span className="font-bold text-brand-dark">1-{Math.min(displayCount, filteredProducts.length)}</span> of <span className="font-bold text-brand-dark">{filteredProducts.length}</span> products
            </p>
            <div className="flex items-center gap-2">
              <label className="text-sm text-brand-gray">Show:</label>
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-brand-teal focus:border-brand-teal min-h-[44px]"
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              >
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
                <option value={72}>72</option>
                <option value={filteredProducts.length}>All ({filteredProducts.length})</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-sm text-brand-gray whitespace-nowrap">Sort by:</label>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-brand-teal focus:border-brand-teal min-h-[44px] flex-1 sm:flex-none"
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
            >
              <option value="score-desc">Score: High to Low</option>
              <option value="score-asc">Score: Low to High</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedProducts.map((product) => (
            <SimpleProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="flex justify-center mt-8 mb-20 lg:mb-8">
            <button
              onClick={handleLoadMore}
              className="px-6 py-3 text-white font-medium text-sm rounded-lg transition-colors bg-gray-500 hover:bg-gray-600 min-h-[44px]"
            >
              Load More ({filteredProducts.length - displayCount} remaining)
            </button>
          </div>
        )}

        {/* No results message */}
        {filteredProducts.length === 0 && (
          <Card className="p-12 text-center bg-white border border-brand-teal/20 rounded-2xl shadow-lg">
            <CardContent>
              <div className="w-20 h-20 mx-auto mb-6 bg-brand-teal/10 rounded-full flex items-center justify-center">
                <div className="w-10 h-10 bg-brand-teal/20 rounded-full"></div>
              </div>
              <h3 className="text-2xl font-bold text-brand-dark mb-3">No products found</h3>
              <p className="text-brand-gray max-w-md mx-auto mb-6">
                Try adjusting your filters or search terms to find more products.
              </p>
              <button
                onClick={() => {
                  setFilters({
                    search: '',
                    categories: [],
                    brands: [],
                    badges: [],
                    scoreRanges: [],
                    countries: [],
                    priceRange: priceRange,
                    sortBy: 'score-desc'
                  })
                  setResetTrigger(prev => prev + 1)
                }}
                className="inline-flex items-center px-6 py-3 bg-brand-teal text-white rounded-lg hover:bg-brand-teal/90 transition-colors font-medium"
              >
                <X className="w-4 h-4 mr-2" />
                Clear All Filters
              </button>
            </CardContent>
          </Card>
        )}
        </div>
      </div>
    </>
  )
}