'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Shield, User, Key, CheckCircle, AlertCircle } from 'lucide-react'

export default function AdminSetupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      // Create account using Supabase
      const response = await fetch('/api/auth/admin-setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create admin account')
      }

      setMessage('Admin account created successfully! You can now sign in.')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickLogin = async () => {
    setLoading(true)
    setMessage('')
    setError('')

    try {
      // Try to sign in with dev admin credentials
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@bifl.dev',
          password: 'BiflAdmin123'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign in')
      }

      // Redirect to admin dashboard
      window.location.href = '/admin'
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-cream flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link href="/" className="flex justify-center">
            <span className="text-3xl font-bold text-brand-dark">BIFL</span>
          </Link>
          <div className="flex justify-center mt-4">
            <Shield className="w-12 h-12 text-brand-teal" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-brand-dark">
            Admin Setup
          </h2>
          <p className="mt-2 text-center text-sm text-brand-gray">
            Set up your admin access to manage the BIFL platform
          </p>
        </div>

        {message && (
          <div className="text-green-600 text-sm text-center bg-green-50 border border-green-200 rounded-lg p-3 flex items-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            {message}
          </div>
        )}

        {error && (
          <div className="text-red-600 text-sm text-center bg-red-50 border border-red-200 rounded-lg p-3 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            {error}
          </div>
        )}

        {/* Quick Access for Development */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
            <Key className="w-5 h-5 mr-2" />
            Development Access
          </h3>
          <p className="text-sm text-blue-700 mb-4">
            Use the pre-configured development admin account to access the dashboard immediately.
          </p>
          <div className="space-y-2 text-xs text-blue-600 mb-4">
            <p><strong>Email:</strong> admin@bifl.dev</p>
            <p><strong>Password:</strong> BiflAdmin123</p>
          </div>
          <button
            onClick={handleQuickLogin}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Signing in...' : 'Quick Admin Access'}
          </button>
        </div>

        {/* Manual Setup */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-brand-dark mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Create Admin Account
          </h3>

          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-brand-dark">
                Admin Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-teal focus:border-brand-teal"
                placeholder="your-admin@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-brand-dark">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-teal focus:border-brand-teal"
                placeholder="Secure password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-teal text-white py-2 px-4 rounded-lg hover:bg-brand-teal/90 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Creating Account...' : 'Create Admin Account'}
            </button>
          </form>
        </div>

        {/* Navigation */}
        <div className="text-center space-y-2">
          <Link
            href="/auth/signin"
            className="block text-sm text-brand-teal hover:text-brand-dark"
          >
            Already have an account? Sign in
          </Link>
          <Link
            href="/products"
            className="block text-sm text-brand-gray hover:text-brand-dark"
          >
            Continue browsing products
          </Link>
        </div>
      </div>
    </div>
  )
}