'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export const dynamic = 'force-dynamic'

export default function SignUpPage() {
  const router = useRouter()
  const [error, setError] = useState<string>('')
  const [message, setMessage] = useState<string>('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const { data, error } = await authClient.signUp.email({
        email,
        password,
        name,
      })

      if (error) {
        setError(error.message || 'Failed to sign up. Please try again.')
        setLoading(false)
        return
      }

      // Success! Show message about email verification
      setMessage('Success! Please check your email to verify your account.')
      setLoading(false)

      // Redirect to signin after 3 seconds
      setTimeout(() => {
        router.push('/auth/signin?message=Please check your email to verify your account')
      }, 3000)
    } catch (err: any) {
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
            Sign Up
          </h2>
          <p className="mt-2 text-center text-sm text-brand-gray">
            Create your account to access premium features
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
              <label htmlFor="name" className="block text-sm font-medium text-brand-dark">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                disabled={loading}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-teal focus:border-brand-teal disabled:opacity-50"
                placeholder="Enter your full name"
              />
            </div>

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
                minLength={8}
                disabled={loading}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-teal focus:border-brand-teal disabled:opacity-50"
                placeholder="Choose a strong password (min 8 characters)"
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
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/auth/signin"
              className="text-sm text-brand-teal hover:text-brand-dark"
            >
              Already have an account? Sign in
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
