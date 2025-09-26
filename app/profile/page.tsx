'use client'

import { useSession } from '@/components/auth/auth-client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ProfilePage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/auth/signin')
    }
  }, [session, isPending, router])

  if (isPending) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="w-8 h-8 animate-spin rounded-full border-2 border-brand-teal border-t-transparent"></div>
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-3xl font-bold text-brand-dark mb-8">Profile</h1>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-brand-dark mb-2">
                Name
              </label>
              <div className="text-brand-gray">
                {session.user.name || 'Not provided'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-dark mb-2">
                Email
              </label>
              <div className="text-brand-gray">
                {session.user.email}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-dark mb-2">
                Member Since
              </label>
              <div className="text-brand-gray">
                {session.user.createdAt ?
                  new Date(session.user.createdAt).toLocaleDateString() :
                  'Unknown'
                }
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-bold text-brand-dark mb-4">Account Settings</h2>
            <p className="text-brand-gray">
              Profile management features coming soon. You can update your preferences and account settings here.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}