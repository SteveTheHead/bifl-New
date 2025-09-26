'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

interface FilterProps {
  onFiltersChange: (filters: {
    search: string
    categories: string[]
    brands: string[]
    scoreRanges: string[]
    countries: string[]
    priceRange: [number, number]
    sortBy: string
  }) => void
  categories: any[]
  products: any[]
}

export function ProductFilters({ onFiltersChange, categories, products }: FilterProps) {
  const [search, setSearch] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
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
        product.wordpress_meta?.brand_name?.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower)
      )
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product =>
        selectedCategories.includes(product.category_id)
      )
    }

    // Apply brand filter
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(product =>
        selectedBrands.includes(product.wordpress_meta?.brand_name)
      )
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
            default: return false
          }
        })
      })
    }

    // Apply country filter
    if (selectedCountries.length > 0) {
      filtered = filtered.filter(product =>
        selectedCountries.includes(product.country_of_origin)
      )
    }

    return filtered
  }, [products, search, selectedCategories, selectedBrands, selectedScoreRanges, selectedCountries])

  const priceStats = useMemo(() => {
    if (filteredProductsForPriceCalc.length === 0) return { min: 0, max: 1000 }
    const prices = filteredProductsForPriceCalc.map(p => parseFloat(p.price)).filter(p => !isNaN(p))
    if (prices.length === 0) return { min: 0, max: 1000 }
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices))
    }
  }, [filteredProductsForPriceCalc])

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])

  // Update price range when priceStats change (but keep current values if they're within the new range)
  useEffect(() => {
    setPriceRange(prev => [
      Math.max(prev[0], priceStats.min), // Don't go below new minimum
      Math.min(prev[1], priceStats.max)  // Don't go above new maximum
    ])
  }, [priceStats.min, priceStats.max])

  // Update parent when filters change
  useEffect(() => {
    onFiltersChange({
      search,
      categories: selectedCategories,
      brands: selectedBrands,
      scoreRanges: selectedScoreRanges,
      countries: selectedCountries,
      priceRange,
      sortBy
    })
  }, [search, selectedCategories, selectedBrands, selectedScoreRanges, selectedCountries, priceRange, sortBy, onFiltersChange])

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

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const toggleBrand = (brandId: string) => {
    setSelectedBrands(prev =>
      prev.includes(brandId)
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId]
    )
  }

  const toggleScoreRange = (range: string) => {
    setSelectedScoreRanges(prev =>
      prev.includes(range)
        ? prev.filter(r => r !== range)
        : [...prev, range]
    )
  }

  const toggleCountry = (country: string) => {
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
    setSelectedScoreRanges([])
    setSelectedCountries([])
    setPriceRange([priceStats.min, priceStats.max])
    setSortBy('score-desc')
    setBrandSearch('')
    setShowBrandDropdown(false)
  }

  // Calculate product counts for categories and brands
  const getCategoryCount = (categoryId: string) => {
    if (!products) return 0
    return products.filter(product => product.category_id === categoryId).length
  }

  const getBrandCount = (brandName: string) => {
    if (!products) return 0
    return products.filter(product =>
      product.wordpress_meta?.brand_name === brandName
    ).length
  }

  const getCountryCount = (country: string) => {
    if (!products) return 0
    return products.filter(product => product.country_of_origin === country).length
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
      .map(product => product.wordpress_meta?.brand_name)
      .filter(brand => brand && brand.trim() !== '')
    )].sort() : []

  // Filter brands based on search
  const filteredBrands = allBrands.filter(brand =>
    brand.toLowerCase().includes(brandSearch.toLowerCase())
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
    { range: '9.0-10', label: '9.0 - 10 (Legend)', gradient: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 50%, #81C784 100%)' },
    { range: '8.0-8.9', label: '8.0 - 8.9 (Excellent)', gradient: 'linear-gradient(135deg, #FFC107 0%, #FFD54F 50%, #FFE082 100%)' },
    { range: '7.0-7.9', label: '7.0 - 7.9 (Good)', gradient: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 50%, #FFCC02 100%)' },
    { range: '6.0-6.9', label: '6.0 - 6.9 (Fair)', gradient: 'linear-gradient(135deg, #F44336 0%, #EF5350 50%, #E57373 100%)' }
  ]

  return (
    <aside className="col-span-3">
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
      <div className="sticky top-28">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-2xl font-bold mb-6 border-b pb-4">Filters</h3>

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
                        onChange={() => toggleCategory(category.id)}
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
                {countries.map((country) => (
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
          <Button
            onClick={clearAllFilters}
            variant="outline"
            className="w-full"
          >
            Clear All Filters
          </Button>
        </div>
      </div>
    </aside>
  )
}