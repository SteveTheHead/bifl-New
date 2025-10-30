'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User } from 'lucide-react'
import { AvatarUpload } from '@/components/user/avatar-upload'
import { useSession, authClient } from '@/lib/auth-client'

export default function AccountSettingsPage() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [name, setName] = useState('')

  // Initialize name from session
  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name)
    }
  }, [session?.user?.name])

  // Redirect if not authenticated
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/auth/signin')
    }
  }, [session, isPending, router])

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      setMessage('Please enter your name')
      return
    }

    setSaving(true)
    setMessage('')

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Profile updated successfully!')
        // Refresh the session to get updated data
        await authClient.$fetch('/api/auth/get-session')
      } else {
        setMessage(data.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpdate = async (avatarUrl: string | null) => {
    // Refresh the session to get the updated avatar
    await authClient.$fetch('/api/auth/get-session')
  }

  if (isPending) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin rounded-full border-2 border-brand-teal border-t-transparent mx-auto mb-4"></div>
          <p className="text-brand-gray">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <Link
              href="/user-dashboard"
              className="flex items-center text-brand-gray hover:text-brand-dark transition-colors mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-brand-dark">Account Settings</h1>
              <p className="text-brand-gray mt-1">
                Manage your account preferences and security
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('success')
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message}
          </div>
        )}

        {/* Avatar Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center mb-6">
            <User className="w-6 h-6 text-brand-teal mr-3" />
            <h2 className="text-xl font-bold text-brand-dark">Profile Picture</h2>
          </div>

          <AvatarUpload
            currentAvatarUrl={session.user.image}
            userName={session.user.name || session.user.email || 'User'}
            onAvatarUpdate={handleAvatarUpdate}
          />
        </div>

        {/* Profile Information */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center mb-6">
            <User className="w-6 h-6 text-brand-teal mr-3" />
            <h2 className="text-xl font-bold text-brand-dark">Profile Information</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-dark mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-brand-teal focus:border-brand-teal"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-dark mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={session.user.email || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-gray-50 text-gray-500"
                placeholder="Enter your email"
              />
              <p className="text-xs text-brand-gray mt-1">Email cannot be changed at this time</p>
            </div>

            <div className="pt-4">
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="w-full px-4 py-2 bg-brand-teal text-white font-semibold rounded-lg hover:bg-brand-teal/90 focus:outline-none focus:ring-2 focus:ring-brand-teal focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}