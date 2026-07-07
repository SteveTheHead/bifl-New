'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { trackFilterUsage } from '@/lib/analytics'
import type { ProductFacets } from '@/lib/supabase/queries'

interface Category {
  id: string
  name: string
  slug: string
}

export interface FilterState {
  search: string
  categories: string[]
  brands: string[]
  badges: string[]
  scoreRanges: string[]
  countries: string[]
  priceRange: [number, number]
}

interface FilterProps {
  onFiltersChange: (filters: FilterState) => void
  categories: Category[]
  allCategories?: Category[]
  facets: ProductFacets
  /** Current filter state parsed from the URL by the parent. */
  value: FilterState
}

/**
 * Filter sidebar. Fully controlled: state lives in the URL (parsed by the
 * parent into `value`); every change goes up via onFiltersChange, which the
 * parent turns back into URL params. Options and counts come from the
 * server-computed facets instead of the full product list (audit M6).
 */
export function ProductFilters({ onFiltersChange, categories, allCategories, facets, value }: FilterProps) {
  const [brandSearch, setBrandSearch] = useState('')
  const [showBrandDropdown, setShowBrandDropdown] = useState(false)
  // Local echo of the search text + price sliders so typing/dragging feels
  // instant while the parent debounces the URL/server update.
  const [searchText, setSearchText] = useState(value.search)
  const [priceRange, setPriceRange] = useState<[number, number]>(value.priceRange)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const priceBounds = facets.priceRange

  // Re-sync local echoes when the URL-derived value changes (back/forward
  // nav, Clear All, category header links).
  useEffect(() => {
    setSearchText(value.search)
  }, [value.search])
  useEffect(() => {
    setPriceRange(value.priceRange)
  }, [value.priceRange])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowBrandDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const emit = (patch: Partial<FilterState>) => {
    onFiltersChange({ ...value, search: searchText, priceRange, ...patch })
  }

  const toggleIn = (list: string[], item: string) =>
    list.includes(item) ? list.filter((x) => x !== item) : [...list, item]

  const toggleCategory = (categoryId: string, categoryName?: string) => {
    if (!value.categories.includes(categoryId)) trackFilterUsage('category', categoryName || categoryId)
    emit({ categories: toggleIn(value.categories, categoryId) })
  }

  const toggleBadge = (badge: string) => {
    if (!value.badges.includes(badge)) trackFilterUsage('badge', badge)
    emit({ badges: toggleIn(value.badges, badge) })
  }

  const toggleScoreRange = (range: string) => {
    if (!value.scoreRanges.includes(range)) trackFilterUsage('score_range', range)
    emit({ scoreRanges: toggleIn(value.scoreRanges, range) })
  }

  const toggleCountry = (country: string) => {
    if (!value.countries.includes(country)) trackFilterUsage('country', country)
    emit({ countries: toggleIn(value.countries, country) })
  }

  const clearAllFilters = () => {
    setSearchText('')
    setPriceRange(priceBounds)
    setBrandSearch('')
    setShowBrandDropdown(false)
    onFiltersChange({
      search: '',
      categories: [],
      brands: [],
      badges: [],
      scoreRanges: [],
      countries: [],
      priceRange: priceBounds,
    })
  }

  // Rolled-up category count: the category itself plus its subcategories
  const getCategoryCount = (categoryId: string) => {
    let count = facets.categoryCounts[categoryId] ?? 0
    if (allCategories) {
      for (const cat of allCategories) {
        if ((cat as any).parent_id === categoryId) {
          count += facets.categoryCounts[cat.id] ?? 0
        }
      }
    }
    return count
  }

  const filteredBrands = facets.brands.filter((b) =>
    b.name.toLowerCase().includes(brandSearch.toLowerCase())
  )

  const removeBrand = (brand: string) => emit({ brands: value.brands.filter((b) => b !== brand) })

  const addBrand = (brand: string) => {
    if (!value.brands.includes(brand)) emit({ brands: [...value.brands, brand] })
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
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value)
                  emit({ search: e.target.value })
                }}
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
                        checked={value.categories.includes(category.id)}
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
                const count = facets.badgeCounts[badge] ?? 0
                if (count === 0) return null
                return (
                  <li key={badge}>
                    <label className="flex items-center justify-between hover:text-brand-dark transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={value.badges.includes(badge)}
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
                      checked={value.scoreRanges.includes(range)}
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
          {facets.brands.length > 0 && (
            <div className="mb-8">
              <h4 className="font-semibold mb-4 text-lg">Brand</h4>

              {/* Selected brands */}
              {value.brands.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {value.brands.map((brand) => (
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
                      filteredBrands.slice(0, 10).map(({ name, count }) => (
                        <button
                          key={name}
                          onClick={() => addBrand(name)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                          disabled={value.brands.includes(name)}
                        >
                          <span className={value.brands.includes(name) ? 'text-gray-400' : ''}>{name}</span>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                            {count}
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
          {facets.countries.length > 0 && (
            <div className="mb-8">
              <h4 className="font-semibold mb-4 text-lg">Country of Origin</h4>
              <ul className="space-y-2 text-brand-gray max-h-48 overflow-y-auto">
                {facets.countries.map(({ name, count }) => (
                  <li key={name}>
                    <label className="flex items-center justify-between hover:text-brand-dark transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={value.countries.includes(name)}
                          onChange={() => toggleCountry(name)}
                          className="w-4 h-4 text-brand-teal border-gray-300 rounded focus:ring-brand-teal"
                        />
                        <span>{name}</span>
                      </div>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                        {count}
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
                <span>${priceRange[1].toFixed(0)}</span>
              </div>

              {/* Simple range sliders */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Minimum Price</label>
                  <input
                    type="range"
                    min={priceBounds[0]}
                    max={priceBounds[1]}
                    step="1"
                    value={priceRange[0]}
                    onChange={(e) => {
                      const v = Number(e.target.value)
                      if (v <= priceRange[1]) {
                        setPriceRange([v, priceRange[1]])
                        emit({ priceRange: [v, priceRange[1]] })
                      }
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-slider"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Maximum Price</label>
                  <input
                    type="range"
                    min={priceBounds[0]}
                    max={priceBounds[1]}
                    step="1"
                    value={priceRange[1]}
                    onChange={(e) => {
                      const v = Number(e.target.value)
                      if (v >= priceRange[0]) {
                        setPriceRange([priceRange[0], v])
                        emit({ priceRange: [priceRange[0], v] })
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
                      const v = Number(e.target.value)
                      if (v >= priceBounds[0] && v <= priceRange[1]) {
                        setPriceRange([v, priceRange[1]])
                        emit({ priceRange: [v, priceRange[1]] })
                      }
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-brand-teal focus:border-brand-teal"
                    min={priceBounds[0]}
                    max={priceRange[1]}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500 block mb-1">Max ($)</label>
                  <input
                    type="number"
                    value={priceRange[1].toFixed(0)}
                    onChange={(e) => {
                      const v = Number(e.target.value)
                      if (v <= priceBounds[1] && v >= priceRange[0]) {
                        setPriceRange([priceRange[0], v])
                        emit({ priceRange: [priceRange[0], v] })
                      }
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-brand-teal focus:border-brand-teal"
                    min={priceRange[0]}
                    max={priceBounds[1]}
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
