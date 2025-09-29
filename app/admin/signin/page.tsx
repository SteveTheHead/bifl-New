'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Shield, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'

export default function AdminSignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign in')
      }

      setMessage('Admin access granted! Redirecting to dashboard...')

      // Redirect to admin dashboard with a hard refresh to ensure middleware recognizes session
      setTimeout(() => {
        window.location.replace('/admin')
      }, 1500)

    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickAccess = async () => {
    setEmail('admin@bifl.dev')
    setPassword('AdminPassword123!')

    // Trigger the form submission after setting values
    setTimeout(() => {
      const formElement = document.querySelector('form')
      if (formElement) {
        formElement.requestSubmit()
      }
    }, 100)
  }

  return (
    <div className="min-h-screen bg-brand-cream flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="flex justify-center mb-6">
            <span className="text-3xl font-bold text-brand-dark">BIFL</span>
          </Link>

          <div className="flex justify-center mb-4">
            <div className="bg-brand-teal/10 p-3 rounded-full">
              <Shield className="w-8 h-8 text-brand-teal" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-brand-dark">
            Admin Sign In
          </h2>
          <p className="mt-2 text-sm text-brand-gray">
            Access the BIFL administration dashboard
          </p>
        </div>

        {/* Messages */}
        {message && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
            <span className="text-green-700 text-sm">{message}</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        {/* Quick Access */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Quick Access
          </h3>
          <p className="text-sm text-blue-700 mb-4">
            Use the pre-configured admin credentials for immediate access.
          </p>
          <button
            onClick={handleQuickAccess}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? 'Signing in...' : 'Quick Admin Access'}
          </button>
        </div>

        {/* Sign In Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-brand-dark mb-6 text-center">
            Or sign in with your credentials
          </h3>

          <form onSubmit={handleSignIn} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-brand-dark mb-2">
                Admin Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                  placeholder="admin@bifl.dev"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-brand-dark mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-teal text-white py-3 px-4 rounded-lg hover:bg-brand-teal/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? 'Signing in...' : 'Sign In to Admin'}
            </button>
          </form>
        </div>

        {/* Footer Links */}
        <div className="text-center space-y-3">
          <Link
            href="/admin-setup"
            className="block text-sm text-brand-teal hover:text-brand-dark transition-colors"
          >
            Need to set up admin access?
          </Link>

          <div className="flex items-center justify-center space-x-4 text-sm text-brand-gray">
            <Link
              href="/auth/signin"
              className="hover:text-brand-dark transition-colors"
            >
              User Sign In
            </Link>
            <span>•</span>
            <Link
              href="/products"
              className="hover:text-brand-dark transition-colors"
            >
              Browse Products
            </Link>
            <span>•</span>
            <Link
              href="/"
              className="hover:text-brand-dark transition-colors"
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}