'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { Menu, X, Search, User, LogOut } from 'lucide-react'
import { useSession, signOut } from '@/components/auth/auth-client'
import { AISearch } from '../search/ai-search'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const { data: session, isPending } = useSession()
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Fix hydration mismatch
  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    setShowUserMenu(false)
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="flex flex-col leading-none -space-y-2.5">
              <span className="text-base font-bold text-brand-dark">BUYITFORLIFE</span>
              <span className="text-base font-bold text-brand-gray">
                PRODUCTS<span className="text-xs font-normal">.com</span>
              </span>
            </div>
          </Link>

          {/* Desktop Center - Search */}
          <div className="hidden md:flex items-center justify-center flex-1 max-w-4xl mx-8">
            <div className="w-full">
              <AISearch />
            </div>
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Navigation Links */}
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

            {/* User Authentication */}
            {!isClient ? (
              <div className="p-2 text-brand-gray">
                <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : isPending ? (
              <div className="p-2 text-brand-gray">
                <div className="w-5 h-5 animate-spin rounded-full border-2 border-brand-gray border-t-transparent"></div>
              </div>
            ) : !session?.user ? (
              <Link
                href="/auth/signin"
                className="flex items-center space-x-2 p-2 text-brand-gray hover:text-brand-dark transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="text-sm font-medium">Sign In</span>
              </Link>
            ) : (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 text-brand-gray hover:text-brand-dark"
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm font-medium">{session.user.name || session.user.email}</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-brand-gray hover:bg-gray-50 hover:text-brand-dark"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/favorites"
                      className="block px-4 py-2 text-sm text-brand-gray hover:bg-gray-50 hover:text-brand-dark"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Favorites
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-brand-gray hover:bg-gray-50 hover:text-brand-dark flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
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
              {isPending ? (
                <div className="flex items-center justify-center py-3">
                  <div className="w-5 h-5 animate-spin rounded-full border-2 border-brand-gray border-t-transparent"></div>
                </div>
              ) : session?.user ? (
                <>
                  <div className="text-brand-dark font-medium mb-3 px-1">
                    Welcome, {session.user.name || session.user.email}
                  </div>
                  <Link
                    href="/profile"
                    className="block text-brand-gray hover:text-brand-dark font-medium mb-3"
                    onClick={() => setIsOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/favorites"
                    className="block text-brand-gray hover:text-brand-dark font-medium mb-3"
                    onClick={() => setIsOpen(false)}
                  >
                    Favorites
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut()
                      setIsOpen(false)
                    }}
                    className="block text-brand-gray hover:text-brand-dark font-medium mb-3 w-full text-left"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/signin"
                  className="block text-brand-gray hover:text-brand-dark font-medium mb-3"
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Link>
              )}
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