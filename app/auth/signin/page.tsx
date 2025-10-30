'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export const dynamic = 'force-dynamic'

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string>('')
  const [message, setMessage] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const returnUrl = searchParams.get('returnUrl')

  useEffect(() => {
    // Get message or error from URL
    const urlMessage = searchParams.get('message')
    const urlError = searchParams.get('error')
    if (urlMessage) setMessage(urlMessage)
    if (urlError) setError(urlError)
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      console.log('🔐 Attempting sign in for:', email)
      const { data, error } = await authClient.signIn.email({
        email,
        password,
      })

      console.log('📥 Sign in response:', { data, error })

      if (error) {
        console.error('❌ Sign in error:', error)
        if (error.message?.includes('verify') || error.message?.includes('verification')) {
          setError('Please verify your email before signing in. Check your inbox for the verification link.')
        } else if (error.message?.includes('credentials') || error.message?.includes('Invalid')) {
          setError('Invalid email or password. Please try again.')
        } else {
          setError(error.message || 'Failed to sign in. Please try again.')
        }
        setLoading(false)
        return
      }

      // Success! Wait a moment for cookie to be set, then redirect
      console.log('✅ Sign in successful! Session:', data)
      console.log('⏳ Waiting for cookie to be set...')

      // Wait 500ms for cookie to be properly set
      await new Promise(resolve => setTimeout(resolve, 500))

      console.log('📍 Cookie should be set, redirecting now...')
      setLoading(false)

      if (returnUrl && returnUrl.startsWith('/')) {
        console.log('📍 Redirecting to:', returnUrl)
        window.location.href = returnUrl
      } else {
        console.log('📍 Redirecting to: /user-dashboard')
        window.location.href = '/user-dashboard'
      }
    } catch (err: any) {
      console.error('💥 Sign in exception:', err)
      setError(err.message || 'An unexpected error occurred')
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
          <h2 className="mt-6 text-center text-3xl font-bold text-brand-dark">
            Sign In
          </h2>
          <p className="mt-2 text-center text-sm text-brand-gray">
            Enter your credentials to access your dashboard
          </p>
        </div>

        {message && (
          <div className="text-green-600 text-sm text-center bg-green-50 border border-green-200 rounded-lg p-3">
            {message}
          </div>
        )}

        {error && (
          <div className="text-red-600 text-sm text-center bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-brand-dark">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                disabled={loading}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-teal focus:border-brand-teal disabled:opacity-50"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-brand-dark">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                disabled={loading}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-teal focus:border-brand-teal disabled:opacity-50"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-white font-medium rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-teal disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#4A9D93' }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/auth/signup"
              className="text-sm text-brand-teal hover:text-brand-dark"
            >
              Don&apos;t have an account? Sign up
            </Link>
          </div>

          <div className="text-center">
            <Link
              href="/products"
              className="text-sm text-brand-gray hover:text-brand-dark"
            >
              Continue browsing products
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
