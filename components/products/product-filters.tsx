'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

interface FilterProps {
  onFiltersChange: (filters: {
    search: string
    categories: string[]
    brands: string[]
    scoreRanges: string[]
    sortBy: string
  }) => void
  categories: any[]
  brands: any[]
  products: any[]
}

export function ProductFilters({ onFiltersChange, categories, brands, products }: FilterProps) {
  const [search, setSearch] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedScoreRanges, setSelectedScoreRanges] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('score-desc')

  // Update parent when filters change
  useEffect(() => {
    onFiltersChange({
      search,
      categories: selectedCategories,
      brands: selectedBrands,
      scoreRanges: selectedScoreRanges,
      sortBy
    })
  }, [search, selectedCategories, selectedBrands, selectedScoreRanges, sortBy, onFiltersChange])

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

  const clearAllFilters = () => {
    setSearch('')
    setSelectedCategories([])
    setSelectedBrands([])
    setSelectedScoreRanges([])
    setSortBy('score-desc')
  }

  // Calculate product counts for categories and brands
  const getCategoryCount = (categoryId: string) => {
    if (!products) return 0
    return products.filter(product => product.category_id === categoryId).length
  }

  const getBrandCount = (brandId: string) => {
    if (!products) return 0
    return products.filter(product => product.brand_id === brandId).length
  }

  const scoreRanges = [
    { range: '9.0-10', label: '9.0 - 10 (Legend)', gradient: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 50%, #81C784 100%)' },
    { range: '8.0-8.9', label: '8.0 - 8.9 (Excellent)', gradient: 'linear-gradient(135deg, #FFC107 0%, #FFD54F 50%, #FFE082 100%)' },
    { range: '7.0-7.9', label: '7.0 - 7.9 (Good)', gradient: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 50%, #FFCC02 100%)' },
    { range: '6.0-6.9', label: '6.0 - 6.9 (Fair)', gradient: 'linear-gradient(135deg, #F44336 0%, #EF5350 50%, #E57373 100%)' }
  ]

  return (
    <aside className="col-span-3">
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
          {brands && brands.length > 0 && (
            <div className="mb-8">
              <h4 className="font-semibold mb-4 text-lg">Brand</h4>
              <ul className="space-y-2 text-brand-gray max-h-48 overflow-y-auto">
                {brands.slice(0, 10).map((brand) => (
                  <li key={brand.id}>
                    <label className="flex items-center justify-between hover:text-brand-dark transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand.id)}
                          onChange={() => toggleBrand(brand.id)}
                          className="w-4 h-4 text-brand-teal border-gray-300 rounded focus:ring-brand-teal"
                        />
                        <span>{brand.name}</span>
                      </div>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                        {getBrandCount(brand.id)}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )}

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