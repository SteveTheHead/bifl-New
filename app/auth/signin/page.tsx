import Link from 'next/link'
import { login } from '../actions'

export default async function SignInPage({
  searchParams
}: {
  searchParams: Promise<{ message?: string; error?: string; returnUrl?: string }>
}) {
  const params = await searchParams
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

        {params.message && (
          <div className="text-green-600 text-sm text-center bg-green-50 border border-green-200 rounded-lg p-3">
            {params.message}
          </div>
        )}

        {params.error && (
          <div className="text-red-600 text-sm text-center bg-red-50 border border-red-200 rounded-lg p-3">
            {params.error}
          </div>
        )}

        <form className="mt-8 space-y-6" action={login}>
          {params.returnUrl && (
            <input type="hidden" name="returnUrl" value={params.returnUrl} />
          )}
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
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-teal focus:border-brand-teal"
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
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-teal focus:border-brand-teal"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-white font-medium rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-teal"
              style={{ backgroundColor: '#4A9D93' }}
            >
              Sign In
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