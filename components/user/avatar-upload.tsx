'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Camera, Upload, X } from 'lucide-react'

interface AvatarUploadProps {
  currentAvatarUrl?: string | null
  userName?: string
  onAvatarUpdate?: (avatarUrl: string | null) => void
}

export function AvatarUpload({ currentAvatarUrl, userName, onAvatarUpdate }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getInitials = (name?: string) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }


    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a JPEG, PNG, or WebP image.')
      return
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setError('File too large. Please upload an image smaller than 5MB.')
      return
    }


    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
      setError('')
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.[0]) {
      return
    }

    setIsUploading(true)
    setError('')
    setSuccess('')

    try {
      const formData = new FormData()
      formData.append('avatar', fileInputRef.current.files[0])

      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setSuccess('Avatar updated successfully!')
      setPreview(null)
      onAvatarUpdate?.(data.avatar_url)

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // Clear success message after 3 seconds instead of reloading
      setTimeout(() => {
        setSuccess('')
      }, 3000)
    } catch (err) {
      console.error('❌ Upload error:', err)
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveAvatar = async () => {
    setIsUploading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/user/avatar', {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove avatar')
      }

      setSuccess('Avatar removed successfully!')
      onAvatarUpdate?.(null)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove avatar')
    } finally {
      setIsUploading(false)
    }
  }

  const cancelPreview = () => {
    setPreview(null)
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const displayImageUrl = preview || currentAvatarUrl

  return (
    <div className="space-y-4">
      {/* Avatar Display */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          {displayImageUrl ? (
            <Image
              src={displayImageUrl}
              alt="Avatar"
              width={80}
              height={80}
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-brand-teal flex items-center justify-center border-2 border-gray-200">
              <span className="text-white font-medium text-lg">
                {getInitials(userName)}
              </span>
            </div>
          )}

          {/* Camera overlay for current avatar */}
          {!preview && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
              disabled={isUploading}
            >
              <Camera className="w-6 h-6 text-white" />
            </button>
          )}
        </div>

        <div className="flex-1">
          <p className="text-sm font-medium text-brand-dark">Profile Picture</p>
          <p className="text-xs text-brand-gray">
            Upload a photo to personalize your profile. JPG, PNG, or WebP up to 5MB.
          </p>
        </div>
      </div>

      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Preview Actions */}
      {preview && (
        <div className="flex space-x-2">
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="flex items-center px-4 py-2 bg-brand-teal text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
          >
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? 'Uploading...' : 'Upload Avatar'}
          </button>
          <button
            onClick={cancelPreview}
            disabled={isUploading}
            className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </button>
        </div>
      )}

      {/* Regular Actions */}
      {!preview && (
        <div className="flex space-x-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center px-4 py-2 bg-brand-teal text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
          >
            <Upload className="w-4 h-4 mr-2" />
            {currentAvatarUrl ? 'Change Avatar' : 'Upload Avatar'}
          </button>

          {currentAvatarUrl && (
            <button
              onClick={handleRemoveAvatar}
              disabled={isUploading}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm"
            >
              <X className="w-4 h-4 mr-2" />
              Remove
            </button>
          )}
        </div>
      )}

      {/* Messages */}
      {error && (
        <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </div>
      )}

      {success && (
        <div className="text-green-600 text-sm bg-green-50 border border-green-200 rounded-lg p-3">
          {success}
        </div>
      )}
    </div>
  )
}

// Separate Avatar component for display only
interface AvatarProps {
  src?: string | null
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
  const getInitials = (name?: string) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl'
  }

  const baseClasses = `rounded-full object-cover border border-gray-200 flex items-center justify-center ${sizeClasses[size]} ${className}`

  if (src) {
    return (
      <Image
        src={src}
        alt={name || 'User avatar'}
        width={size === 'sm' ? 32 : size === 'md' ? 40 : size === 'lg' ? 48 : 64}
        height={size === 'sm' ? 32 : size === 'md' ? 40 : size === 'lg' ? 48 : 64}
        className={baseClasses}
      />
    )
  }

  return (
    <div className={`${baseClasses} bg-brand-teal text-white font-medium`}>
      {getInitials(name)}
    </div>
  )
}