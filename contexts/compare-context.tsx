'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'

interface Product {
  id: string
  name: string
  price: number
  images: string[]
  average_score?: number
  purchase_url?: string
}

interface CompareContextType {
  compareProducts: Product[]
  addToCompare: (product: Product) => void
  removeFromCompare: (productId: string) => void
  clearCompare: () => void
  isInCompare: (productId: string) => boolean
  showCompareModal: boolean
  setShowCompareModal: (show: boolean) => void
  canAddMore: boolean
}

const CompareContext = createContext<CompareContextType | undefined>(undefined)

const MAX_COMPARE_PRODUCTS = 3

interface CompareProviderProps {
  children: ReactNode
}

export function CompareProvider({ children }: CompareProviderProps) {
  const [compareProducts, setCompareProducts] = useLocalStorage<Product[]>('compare-products', [])
  const [showCompareModal, setShowCompareModal] = useState(false)

  const addToCompare = (product: Product) => {
    if (compareProducts.length >= MAX_COMPARE_PRODUCTS) return

    if (!compareProducts.find(p => p.id === product.id)) {
      const newProducts = [...compareProducts, product]
      setCompareProducts(newProducts)

      // Auto-open modal when we have 2+ products
      if (newProducts.length >= 2) {
        setShowCompareModal(true)
      }
    }
  }

  const removeFromCompare = (productId: string) => {
    const newProducts = compareProducts.filter(p => p.id !== productId)
    setCompareProducts(newProducts)

    // Close modal if we have less than 2 products
    if (newProducts.length < 2) {
      setShowCompareModal(false)
    }
  }

  const clearCompare = () => {
    setCompareProducts([])
    setShowCompareModal(false)
  }

  const isInCompare = (productId: string) => {
    return compareProducts.some(p => p.id === productId)
  }

  const canAddMore = compareProducts.length < MAX_COMPARE_PRODUCTS

  return (
    <CompareContext.Provider
      value={{
        compareProducts,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        showCompareModal,
        setShowCompareModal,
        canAddMore,
      }}
    >
      {children}
    </CompareContext.Provider>
  )
}

export function useCompare() {
  const context = useContext(CompareContext)
  if (context === undefined) {
    throw new Error('useCompare must be used within a CompareProvider')
  }
  return context
}