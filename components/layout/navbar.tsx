'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Search, User } from 'lucide-react'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-brand-dark">BIFL</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/products" className="text-brand-gray hover:text-brand-dark font-medium">
              Products
            </Link>
            <Link href="/categories" className="text-brand-gray hover:text-brand-dark font-medium">
              Categories
            </Link>
            <Link href="/brands" className="text-brand-gray hover:text-brand-dark font-medium">
              Brands
            </Link>
            <Link href="/about" className="text-brand-gray hover:text-brand-dark font-medium">
              About
            </Link>
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="p-2 text-brand-gray hover:text-brand-dark">
              <Search className="w-5 h-5" />
            </button>
            <Link href="/auth/signin" className="p-2 text-brand-gray hover:text-brand-dark">
              <User className="w-5 h-5" />
            </Link>
            <Link
              href="/products"
              className="bg-brand-teal text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-opacity"
            >
              Browse Products
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-md text-brand-gray hover:text-brand-dark"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-4">
            <Link
              href="/products"
              className="block text-brand-gray hover:text-brand-dark font-medium"
              onClick={() => setIsOpen(false)}
            >
              Products
            </Link>
            <Link
              href="/categories"
              className="block text-brand-gray hover:text-brand-dark font-medium"
              onClick={() => setIsOpen(false)}
            >
              Categories
            </Link>
            <Link
              href="/brands"
              className="block text-brand-gray hover:text-brand-dark font-medium"
              onClick={() => setIsOpen(false)}
            >
              Brands
            </Link>
            <Link
              href="/about"
              className="block text-brand-gray hover:text-brand-dark font-medium"
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
            <div className="pt-4 border-t border-gray-200">
              <Link
                href="/auth/signin"
                className="block text-brand-gray hover:text-brand-dark font-medium mb-3"
                onClick={() => setIsOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/products"
                className="block bg-brand-teal text-white px-4 py-2 rounded-lg text-center"
                onClick={() => setIsOpen(false)}
              >
                Browse Products
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}