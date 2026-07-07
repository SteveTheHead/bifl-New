'use client'

import Link from 'next/link'
import { BrandForm } from '@/components/admin/brand-form'

export default function NewBrandPage() {
  return (
    <div className="min-h-screen bg-brand-cream">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 space-x-4">
            <Link href="/admin/brands" className="text-brand-gray hover:text-brand-dark">
              ← Brands
            </Link>
            <h1 className="text-2xl font-bold text-brand-dark">Add Brand</h1>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BrandForm />
      </div>
    </div>
  )
}
