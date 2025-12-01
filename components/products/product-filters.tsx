'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { trackFilterUsage } from '@/lib/analytics'

interface Product {
  id: string
  name: string
  slug: string
  brand_name?: string
  bifl_total_score?: number | null
  warranty_score?: number | null
  social_score?: number | null
  repairability_score?: number | null
  sustainability_score?: number | null
  durability_score?: number | null
  price?: number | string | null
  country_of_origin?: string
  bifl_certification?: string[] | null
}

interface Category {
  id: string
  name: string
  slug: string
}

// Import badge calculation from BadgeDisplay
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

interface FilterProps {
  onFiltersChange: (filters: {
    search: string
    categories: string[]
    brands: string[]
    badges: string[]
    scoreRanges: string[]
    countries: string[]
    priceRange: [number, number]
    sortBy: string
  }) => void
  categories: Category[]
  allCategories?: Category[]
  products: Product[]
  currentPriceRange?: [number, number]
  resetTrigger?: number
}

export function ProductFilters({ onFiltersChange, categories, allCategories, products, currentPriceRange, resetTrigger }: FilterProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [search, setSearch] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedBadges, setSelectedBadges] = useState<string[]>([])
  const [selectedScoreRanges, setSelectedScoreRanges] = useState<string[]>([])
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('score-desc')
  const [brandSearch, setBrandSearch] = useState('')
  const [showBrandDropdown, setShowBrandDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Calculate price range from currently filtered products (excluding price filter)
  const filteredProductsForPriceCalc = useMemo(() => {
    if (!products || products.length === 0) return []

    let filtered = [...products]

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(searchLower) ||
        product.brand_name?.toLowerCase().includes(searchLower) ||
        (product as any).description?.toLowerCase().includes(searchLower)
      )
    }

    // Apply category filter (include subcategories)
    if (selectedCategories.length > 0) {
      // Build a list of all category IDs including subcategories
      const categoryIdsToMatch: string[] = []
      selectedCategories.forEach(categoryId => {
        categoryIdsToMatch.push(categoryId)
        // Add all subcategories of this category
        if (allCategories) {
          const subcats = allCategories.filter((cat: any) => cat.parent_id === categoryId)
          subcats.forEach((subcat: any) => categoryIdsToMatch.push(subcat.id))
        }
      })

      filtered = filtered.filter(product =>
        categoryIdsToMatch.includes((product as any).category_id)
      )
    }

    // Apply brand filter
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(product =>
        selectedBrands.includes(product.brand_name || '')
      )
    }

    // Apply badge filter
    if (selectedBadges.length > 0) {
      filtered = filtered.filter(product => {
        const productBadges = product.bifl_certification || calculateBadges(product)
        return selectedBadges.some(badge => productBadges.includes(badge))
      })
    }

    // Apply score range filter
    if (selectedScoreRanges.length > 0) {
      filtered = filtered.filter(product => {
        const score = product.bifl_total_score || 0
        return selectedScoreRanges.some(range => {
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

    // Apply country filter
    if (selectedCountries.length > 0) {
      filtered = filtered.filter(product =>
        product.country_of_origin && selectedCountries.includes(product.country_of_origin)
      )
    }

    return filtered
  }, [products, search, selectedCategories, selectedBrands, selectedBadges, selectedScoreRanges, selectedCountries])

  const priceStats = useMemo(() => {
    if (filteredProductsForPriceCalc.length === 0) return { min: 0, max: 10000 }
    const prices = filteredProductsForPriceCalc.map(p => parseFloat(p.price?.toString() || '0')).filter(p => !isNaN(p) && p > 0)
    if (prices.length === 0) return { min: 0, max: 10000 }
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices))
    }
  }, [filteredProductsForPriceCalc])

  // Initialize with the actual min and max price from all products
  const initialPriceRange = useMemo(() => {
    if (!products || products.length === 0) return [0, 10000] as [number, number]
    const prices = products.map(p => parseFloat(p.price?.toString() || '0')).filter(p => !isNaN(p) && p > 0)
    if (prices.length === 0) return [0, 10000] as [number, number]
    return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))] as [number, number]
  }, [products])

  const [priceRange, setPriceRange] = useState<[number, number]>(initialPriceRange)

  // Sync internal state with URL params (for category header links and Clear All)
  useEffect(() => {
    const urlSearch = searchParams.get('search') || ''
    const urlCategories = searchParams.get('categories')
    const categoryIds = urlCategories ? urlCategories.split(',').filter(Boolean) : []
    const badgeParam = searchParams.get('badge')

    setSearch(urlSearch)
    setSelectedCategories(categoryIds)

    if (badgeParam) {
      setSelectedBadges([badgeParam])
    }

    // When navigating to clean URL (Clear All), reset all other filters too
    if (!urlSearch && !urlCategories && !badgeParam) {
      setSelectedBrands([])
      setSelectedBadges([])
      setSelectedScoreRanges([])
      setSelectedCountries([])
      setSortBy('score-desc')
      setPriceRange(initialPriceRange)
    }
  }, [searchParams, initialPriceRange])

  // Update price range when priceStats change (expand range if needed to show all filtered products)
  useEffect(() => {
    setPriceRange(prev => [
      Math.min(prev[0], priceStats.min), // Expand to include lower prices if needed
      Math.max(prev[1], priceStats.max)  // Expand to include higher prices if needed
    ])
  }, [priceStats.min, priceStats.max])

  // Sync price range when parent resets filters (only when it matches initial range)
  useEffect(() => {
    if (currentPriceRange &&
        currentPriceRange[0] === initialPriceRange[0] &&
        currentPriceRange[1] === initialPriceRange[1] &&
        (priceRange[0] !== initialPriceRange[0] || priceRange[1] !== initialPriceRange[1])) {
      // Only reset if current price range doesn't match initial but incoming does (filter reset)
      setPriceRange(currentPriceRange)
    }
  }, [currentPriceRange, initialPriceRange, priceRange])

  // Reset all internal state when resetTrigger changes
  useEffect(() => {
    if (resetTrigger !== undefined && resetTrigger > 0) {
      setSearch('')
      setSelectedCategories([])
      setSelectedBrands([])
      setSelectedBadges([])
      setSelectedScoreRanges([])
      setSelectedCountries([])
      setPriceRange(initialPriceRange)
      setSortBy('score-desc')
    }
  }, [resetTrigger, initialPriceRange])

  // Update parent when filters change
  useEffect(() => {
    onFiltersChange({
      search,
      categories: selectedCategories,
      brands: selectedBrands,
      badges: selectedBadges,
      scoreRanges: selectedScoreRanges,
      countries: selectedCountries,
      priceRange,
      sortBy
    })
  }, [search, selectedCategories, selectedBrands, selectedBadges, selectedScoreRanges, selectedCountries, priceRange, sortBy, onFiltersChange])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowBrandDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const toggleCategory = (categoryId: string, categoryName?: string) => {
    const isAdding = !selectedCategories.includes(categoryId)
    if (isAdding) {
      trackFilterUsage('category', categoryName || categoryId)
    }
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const toggleBrand = (brandId: string) => {
    const isAdding = !selectedBrands.includes(brandId)
    if (isAdding) {
      trackFilterUsage('brand', brandId)
    }
    setSelectedBrands(prev =>
      prev.includes(brandId)
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId]
    )
  }

  const toggleBadge = (badge: string) => {
    const isAdding = !selectedBadges.includes(badge)
    if (isAdding) {
      trackFilterUsage('badge', badge)
    }
    setSelectedBadges(prev =>
      prev.includes(badge)
        ? prev.filter(b => b !== badge)
        : [...prev, badge]
    )
  }

  const toggleScoreRange = (range: string) => {
    const isAdding = !selectedScoreRanges.includes(range)
    if (isAdding) {
      trackFilterUsage('score_range', range)
    }
    setSelectedScoreRanges(prev =>
      prev.includes(range)
        ? prev.filter(r => r !== range)
        : [...prev, range]
    )
  }

  const toggleCountry = (country: string) => {
    const isAdding = !selectedCountries.includes(country)
    if (isAdding) {
      trackFilterUsage('country', country)
    }
    setSelectedCountries(prev =>
      prev.includes(country)
        ? prev.filter(c => c !== country)
        : [...prev, country]
    )
  }

  const clearAllFilters = () => {
    setSearch('')
    setSelectedCategories([])
    setSelectedBrands([])
    setSelectedBadges([])
    setSelectedScoreRanges([])
    setSelectedCountries([])
    setPriceRange([priceStats.min, priceStats.max])
    setSortBy('score-desc')
    setBrandSearch('')
    setShowBrandDropdown(false)
  }

  // Calculate product counts for categories (including subcategories)
  const getCategoryCount = (categoryId: string) => {
    if (!products || !allCategories) return 0

    // Build a map of category IDs that belong to this parent category
    const subcategoryIds = allCategories
      .filter((cat: any) => cat.parent_id === categoryId)
      .map((cat: any) => cat.id)

    // Count products in this category or any of its subcategories
    return products.filter(product => {
      const productCategoryId = (product as any).category_id
      // Direct match OR product is in a subcategory of this category
      return productCategoryId === categoryId || subcategoryIds.includes(productCategoryId)
    }).length
  }

  const getBrandCount = (brandName: string) => {
    if (!products) return 0
    return products.filter(product =>
      product.brand_name === brandName
    ).length
  }

  const getCountryCount = (country: string) => {
    if (!products) return 0
    return products.filter(product => product.country_of_origin === country).length
  }

  const getBadgeCount = (badgeName: string) => {
    if (!products) return 0
    return products.filter(product => {
      const badges = product.bifl_certification || calculateBadges(product)
      return badges.includes(badgeName)
    }).length
  }

  // Get unique countries from products
  const countries = products ?
    [...new Set(products
      .map(product => product.country_of_origin)
      .filter(country => country && country.trim() !== '')
    )].sort() : []

  // Get unique brands from product metadata
  const allBrands = products ?
    [...new Set(products
      .map(product => product.brand_name)
      .filter(brand => brand && brand.trim() !== '')
    )].sort() : []

  // Filter brands based on search
  const filteredBrands = allBrands.filter((brand): brand is string =>
    brand !== undefined && brand.toLowerCase().includes(brandSearch.toLowerCase())
  )

  const removeBrand = (brandToRemove: string) => {
    setSelectedBrands(prev => prev.filter(brand => brand !== brandToRemove))
  }

  const addBrand = (brand: string) => {
    if (!selectedBrands.includes(brand)) {
      setSelectedBrands(prev => [...prev, brand])
    }
    setBrandSearch('')
    setShowBrandDropdown(false)
  }

  const scoreRanges = [
    { range: '9.0-10', label: '9.0 - 10 (Legend)', gradient: 'linear-gradient(135deg, #00ff88, #00cc66)' },
    { range: '8.0-8.9', label: '8.0 - 8.9 (Excellent)', gradient: 'linear-gradient(135deg, #a3ffbf, #66ff99)' },
    { range: '7.0-7.9', label: '7.0 - 7.9 (Good)', gradient: 'linear-gradient(135deg, #fff886, #fbd786)' },
    { range: '6.0-6.9', label: '6.0 - 6.9 (Fair)', gradient: 'linear-gradient(135deg, #ffb347, #ff9966)' },
    { range: '0.0-5.9', label: '0.0 - 5.9 (Poor)', gradient: 'linear-gradient(135deg, #ff4c4c, #ff6e7f)' }
  ]

  const availableBadges = [
    'Gold Standard',
    'Lifetime Warranty',
    'Crowd Favorite',
    'BIFL Approved',
    'Repair Friendly',
    'Eco Hero'
  ]

  return (
    <aside className="w-full">
      <style jsx>{`
        .range-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 8px;
          background: #e5e7eb;
          border-radius: 6px;
          outline: none;
        }
        .range-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #4A9D93;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(74, 157, 147, 0.3);
          transition: all 0.2s ease;
        }
        .range-slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(74, 157, 147, 0.4);
        }
        .range-slider::-moz-range-thumb {
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #4A9D93;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(74, 157, 147, 0.3);
        }
        .range-slider::-moz-range-track {
          height: 8px;
          background: #e5e7eb;
          border-radius: 6px;
        }
        .range-slider:focus {
          outline: none;
        }
        .range-slider:focus::-webkit-slider-thumb {
          box-shadow: 0 0 0 3px rgba(74, 157, 147, 0.2);
        }
      `}</style>
      <div className="lg:sticky lg:top-28">
        <div className="bg-white lg:p-6 lg:rounded-2xl lg:shadow-lg">
          <h3 className="hidden lg:block text-2xl font-bold mb-6 border-b pb-4">Filters</h3>

          {/* Search */}
          <div className="mb-8">
            <h4 className="font-semibold mb-4 text-lg">Search</h4>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="mb-8">
            <h4 className="font-semibold mb-4 text-lg">Category</h4>
            <ul className="space-y-2 text-brand-gray">
              {categories?.map((category) => (
                <li key={category.id}>
                  <label className="flex items-center justify-between hover:text-brand-dark transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => toggleCategory(category.id, category.name)}
                        className="w-4 h-4 text-brand-teal border-gray-300 rounded focus:ring-brand-teal"
                      />
                      <span>{category.name}</span>
                    </div>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                      {getCategoryCount(category.id)}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          {/* Badges */}
          <div className="mb-8">
            <h4 className="font-semibold mb-4 text-lg">Badges</h4>
            <ul className="space-y-2 text-brand-gray">
              {availableBadges.map((badge) => {
                const count = getBadgeCount(badge)
                if (count === 0) return null
                return (
                  <li key={badge}>
                    <label className="flex items-center justify-between hover:text-brand-dark transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedBadges.includes(badge)}
                          onChange={() => toggleBadge(badge)}
                          className="w-4 h-4 text-brand-teal border-gray-300 rounded focus:ring-brand-teal"
                        />
                        <span>{badge}</span>
                      </div>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                        {count}
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* BIFL Score */}
          <div className="mb-8">
            <h4 className="font-semibold mb-4 text-lg">BIFL Score</h4>
            <ul className="space-y-3">
              {scoreRanges.map(({ range, label, gradient }) => (
                <li key={range}>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedScoreRanges.includes(range)}
                      onChange={() => toggleScoreRange(range)}
                      className="w-4 h-4 text-brand-teal border-gray-300 rounded focus:ring-brand-teal"
                    />
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border border-gray-200"
                        style={{ background: gradient }}
                      ></div>
                      <span>{label}</span>
                    </div>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          {/* Brands */}
          {allBrands && allBrands.length > 0 && (
            <div className="mb-8">
              <h4 className="font-semibold mb-4 text-lg">Brand</h4>

              {/* Selected brands */}
              {selectedBrands.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {selectedBrands.map((brand) => (
                      <span
                        key={brand}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-brand-teal text-white text-sm rounded-full"
                      >
                        {brand}
                        <button
                          onClick={() => removeBrand(brand)}
                          className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Search dropdown */}
              <div className="relative" ref={dropdownRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search brands..."
                    value={brandSearch}
                    onChange={(e) => setBrandSearch(e.target.value)}
                    onFocus={() => setShowBrandDropdown(true)}
                    className="pl-10"
                  />
                </div>

                {/* Dropdown results */}
                {showBrandDropdown && brandSearch && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredBrands.length > 0 ? (
                      filteredBrands.slice(0, 10).map((brand) => (
                        <button
                          key={brand}
                          onClick={() => addBrand(brand)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                          disabled={selectedBrands.includes(brand)}
                        >
                          <span className={selectedBrands.includes(brand) ? 'text-gray-400' : ''}>{brand}</span>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                            {getBrandCount(brand)}
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-gray-500 text-sm">No brands found</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Countries */}
          {countries && countries.length > 0 && (
            <div className="mb-8">
              <h4 className="font-semibold mb-4 text-lg">Country of Origin</h4>
              <ul className="space-y-2 text-brand-gray max-h-48 overflow-y-auto">
                {countries.map((country) => country && (
                  <li key={country}>
                    <label className="flex items-center justify-between hover:text-brand-dark transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedCountries.includes(country)}
                          onChange={() => toggleCountry(country)}
                          className="w-4 h-4 text-brand-teal border-gray-300 rounded focus:ring-brand-teal"
                        />
                        <span>{country}</span>
                      </div>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                        {getCountryCount(country)}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Price Range */}
          <div className="mb-8">
            <h4 className="font-semibold mb-4 text-lg">Price Range</h4>
            <div className="space-y-4">
              {/* Price display */}
              <div className="flex justify-between items-center text-sm text-brand-gray">
                <span>${priceRange[0].toFixed(0)}</span>
                <span className="text-xs">
                  {filteredProductsForPriceCalc.length < products.length
                    ? `${filteredProductsForPriceCalc.length} products`
                    : 'All products'
                  }
                </span>
                <span>${priceRange[1].toFixed(0)}</span>
              </div>

              {/* Simple range sliders */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Minimum Price</label>
                  <input
                    type="range"
                    min={priceStats.min}
                    max={priceStats.max}
                    step="1"
                    value={priceRange[0]}
                    onChange={(e) => {
                      const value = Number(e.target.value)
                      if (value <= priceRange[1]) {
                        setPriceRange([value, priceRange[1]])
                      }
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-slider"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Maximum Price</label>
                  <input
                    type="range"
                    min={priceStats.min}
                    max={priceStats.max}
                    step="1"
                    value={priceRange[1]}
                    onChange={(e) => {
                      const value = Number(e.target.value)
                      if (value >= priceRange[0]) {
                        setPriceRange([priceRange[0], value])
                      }
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-slider"
                  />
                </div>
              </div>

              {/* Price input fields */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-gray-500 block mb-1">Min ($)</label>
                  <input
                    type="number"
                    value={priceRange[0].toFixed(0)}
                    onChange={(e) => {
                      const value = Number(e.target.value)
                      if (value >= priceStats.min && value <= priceRange[1]) {
                        setPriceRange([value, priceRange[1]])
                      }
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-brand-teal focus:border-brand-teal"
                    min={priceStats.min}
                    max={priceRange[1]}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500 block mb-1">Max ($)</label>
                  <input
                    type="number"
                    value={priceRange[1].toFixed(0)}
                    onChange={(e) => {
                      const value = Number(e.target.value)
                      if (value <= priceStats.max && value >= priceRange[0]) {
                        setPriceRange([priceRange[0], value])
                      }
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-brand-teal focus:border-brand-teal"
                    min={priceRange[0]}
                    max={priceStats.max}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          <button
            onClick={clearAllFilters}
            className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium"
          >
            Clear All Filters
          </button>
        </div>
      </div>
    </aside>
  )
}