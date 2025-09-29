'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface Brand {
  name: string
  slug: string
}

interface CategoryFiltersProps {
  availableBrands: Brand[]
  initialFilters: {
    sort?: string
    price_min?: string
    price_max?: string
    brand?: string
  }
  onFilterChange: (filters: Record<string, string | undefined>) => void
  onClearFilters: () => void
}

export function CategoryFilters({
  availableBrands,
  initialFilters,
  onFilterChange,
  onClearFilters
}: CategoryFiltersProps) {
  const [sort, setSort] = useState(initialFilters.sort || 'rating')
  const [priceMin, setPriceMin] = useState(initialFilters.price_min || '')
  const [priceMax, setPriceMax] = useState(initialFilters.price_max || '')
  const [selectedBrand, setSelectedBrand] = useState(initialFilters.brand || '')

  // Sync with URL changes
  useEffect(() => {
    setSort(initialFilters.sort || 'rating')
    setPriceMin(initialFilters.price_min || '')
    setPriceMax(initialFilters.price_max || '')
    setSelectedBrand(initialFilters.brand || '')
  }, [initialFilters])

  const handleSortChange = (newSort: string) => {
    setSort(newSort)
    onFilterChange({
      sort: newSort,
      price_min: priceMin,
      price_max: priceMax,
      brand: selectedBrand
    })
  }

  const handlePriceChange = (newPriceMin: string, newPriceMax: string) => {
    setPriceMin(newPriceMin)
    setPriceMax(newPriceMax)
    onFilterChange({
      sort,
      price_min: newPriceMin,
      price_max: newPriceMax,
      brand: selectedBrand
    })
  }

  const handleBrandChange = (newBrand: string) => {
    setSelectedBrand(newBrand)
    onFilterChange({
      sort,
      price_min: priceMin,
      price_max: priceMax,
      brand: newBrand
    })
  }

  const hasActiveFilters = sort !== 'rating' || priceMin || priceMax || selectedBrand

  return (
    <div className="space-y-6">
      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-brand-dark">Active Filters</span>
          <button
            onClick={onClearFilters}
            className="text-sm text-brand-teal hover:text-brand-teal/80 flex items-center"
          >
            <X className="w-4 h-4 mr-1" />
            Clear All
          </button>
        </div>
      )}

      {/* Sort */}
      <div>
        <label className="block text-sm font-medium text-brand-dark mb-3">
          Sort By
        </label>
        <select
          value={sort}
          onChange={(e) => handleSortChange(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent"
        >
          <option value="rating">BIFL Rating</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="newest">Newest First</option>
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-medium text-brand-dark mb-3">
          Price Range
        </label>
        <div className="space-y-3">
          <div>
            <input
              type="number"
              placeholder="Min price"
              value={priceMin}
              onChange={(e) => handlePriceChange(e.target.value, priceMax)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent"
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="Max price"
              value={priceMax}
              onChange={(e) => handlePriceChange(priceMin, e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Brand Filter */}
      {availableBrands.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-brand-dark mb-3">
            Brand
          </label>
          <select
            value={selectedBrand}
            onChange={(e) => handleBrandChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent"
          >
            <option value="">All Brands</option>
            {availableBrands.map((brand) => (
              <option key={brand.slug} value={brand.slug}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Quick Price Filters */}
      <div>
        <label className="block text-sm font-medium text-brand-dark mb-3">
          Quick Price Filters
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handlePriceChange('', '100')}
            className={`p-2 text-sm rounded-lg border transition-colors ${
              priceMax === '100' && !priceMin
                ? 'bg-brand-teal text-white border-brand-teal'
                : 'border-gray-300 text-brand-gray hover:bg-gray-50'
            }`}
          >
            Under $100
          </button>
          <button
            onClick={() => handlePriceChange('100', '300')}
            className={`p-2 text-sm rounded-lg border transition-colors ${
              priceMin === '100' && priceMax === '300'
                ? 'bg-brand-teal text-white border-brand-teal'
                : 'border-gray-300 text-brand-gray hover:bg-gray-50'
            }`}
          >
            $100-$300
          </button>
          <button
            onClick={() => handlePriceChange('300', '500')}
            className={`p-2 text-sm rounded-lg border transition-colors ${
              priceMin === '300' && priceMax === '500'
                ? 'bg-brand-teal text-white border-brand-teal'
                : 'border-gray-300 text-brand-gray hover:bg-gray-50'
            }`}
          >
            $300-$500
          </button>
          <button
            onClick={() => handlePriceChange('500', '')}
            className={`p-2 text-sm rounded-lg border transition-colors ${
              priceMin === '500' && !priceMax
                ? 'bg-brand-teal text-white border-brand-teal'
                : 'border-gray-300 text-brand-gray hover:bg-gray-50'
            }`}
          >
            Over $500
          </button>
        </div>
      </div>
    </div>
  )
}