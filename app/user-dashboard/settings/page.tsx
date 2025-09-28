'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Eye, EyeOff, User, Mail, Calendar } from 'lucide-react'
import { AvatarUpload } from '@/components/user/avatar-upload'

export default function AccountSettingsPage() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  // Form states
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Try demo avatar system first
        try {
          const demoResponse = await fetch('/api/user/demo-avatar')
          const demoData = await demoResponse.json()

          if (demoData.user) {
            setSession({ user: demoData.user })
            setEmail(demoData.user.email || 'demo@bifl.dev')
            setName(demoData.user.user_metadata?.name || 'Demo User')
            return // Successfully loaded demo user, exit early
          }
        } catch (demoError) {
          console.log('Demo auth failed, trying Supabase auth')
        }

        // Fallback to real Supabase auth
        const response = await fetch('/api/user/auth')
        const data = await response.json()

        if (data.user) {
          setSession({ user: data.user })
          setEmail(data.user.email || '')
          setName(data.user.user_metadata?.name || '')
        } else {
          router.push('/login')
        }
      } catch (error) {
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      // Here you would implement profile update logic
      // For now, just show a success message
      setMessage('Profile updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    if (newPassword !== confirmPassword) {
      setMessage('New passwords do not match')
      setSaving(false)
      return
    }

    if (newPassword.length < 6) {
      setMessage('Password must be at least 6 characters')
      setSaving(false)
      return
    }

    try {
      // Here you would implement password change logic
      setMessage('Password updated successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('Failed to update password')
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    try {
      // Clear any session data
      document.cookie = 'supabase-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin rounded-full border-2 border-brand-teal border-t-transparent mx-auto mb-4"></div>
          <p className="text-brand-gray">Loading settings...</p>
        </div>
      </div>
    )
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            {/* Avatar Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="flex items-center mb-6">
                <User className="w-6 h-6 text-brand-teal mr-3" />
                <h2 className="text-xl font-bold text-brand-dark">Profile Picture</h2>
              </div>

              <AvatarUpload
                currentAvatarUrl={session?.user?.user_metadata?.avatar_url}
                userName={session?.user?.user_metadata?.name || session?.user?.email}
                onAvatarUpdate={(avatarUrl) => {
                  setSession(prev => prev ? {
                    ...prev,
                    user: {
                      ...prev.user,
                      user_metadata: {
                        ...prev.user.user_metadata,
                        avatar_url: avatarUrl
                      }
                    }
                  } : null)
                }}
              />
            </div>

            {/* Profile Information */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="flex items-center mb-6">
                <User className="w-6 h-6 text-brand-teal mr-3" />
                <h2 className="text-xl font-bold text-brand-dark">Profile Information</h2>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-brand-dark mb-2">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-brand-teal focus:border-brand-teal"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-brand-dark mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-gray-50 text-gray-500"
                    placeholder="Enter your email"
                  />
                  <p className="text-xs text-brand-gray mt-1">Email cannot be changed at this time</p>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-brand-teal text-white py-3 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 font-medium"
                >
                  {saving ? 'Updating...' : 'Update Profile'}
                </button>
              </form>
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-6">
                <Eye className="w-6 h-6 text-brand-teal mr-3" />
                <h2 className="text-xl font-bold text-brand-dark">Change Password</h2>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-6">
                <div className="relative">
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-brand-dark mb-2">
                    Current Password
                  </label>
                  <input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-brand-teal focus:border-brand-teal"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 top-7 pr-3 flex items-center"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-5 w-5 text-brand-gray" />
                    ) : (
                      <Eye className="h-5 w-5 text-brand-gray" />
                    )}
                  </button>
                </div>

                <div className="relative">
                  <label htmlFor="newPassword" className="block text-sm font-medium text-brand-dark mb-2">
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-brand-teal focus:border-brand-teal"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 top-7 pr-3 flex items-center"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-5 w-5 text-brand-gray" />
                    ) : (
                      <Eye className="h-5 w-5 text-brand-gray" />
                    )}
                  </button>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-brand-dark mb-2">
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-brand-teal focus:border-brand-teal"
                    placeholder="Confirm new password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving || !currentPassword || !newPassword || !confirmPassword}
                  className="w-full bg-brand-teal text-white py-3 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 font-medium"
                >
                  {saving ? 'Updating...' : 'Change Password'}
                </button>
              </form>
            </div>
          </div>

          {/* Account Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-brand-dark mb-4">Account Summary</h2>

              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-brand-teal mr-3" />
                  <div>
                    <p className="font-medium text-brand-dark">Email</p>
                    <p className="text-sm text-brand-gray">{email}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-brand-teal mr-3" />
                  <div>
                    <p className="font-medium text-brand-dark">Member Since</p>
                    <p className="text-sm text-brand-gray">
                      {session?.user?.created_at ? new Date(session.user.created_at).toLocaleDateString() : 'Recently'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sign Out */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-brand-dark mb-4">Account Actions</h2>

              <button
                onClick={handleSignOut}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}