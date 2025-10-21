'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

interface ImageUploadProps {
  currentImageUrl?: string | null
  onImageUploaded: (url: string) => void
  bucket?: string
  folder?: string
  label?: string
}

export default function ImageUpload({
  currentImageUrl,
  onImageUploaded,
  bucket = 'product-images',
  folder = 'curations',
  label = 'Featured Image'
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl || '')
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  async function uploadImage(file: File) {
    try {
      setUploading(true)
      setError(null)

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file')
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Image must be less than 10MB')
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path)

      setPreviewUrl(publicUrl)
      onImageUploaded(publicUrl)
    } catch (err) {
      console.error('Error uploading image:', err)
      setError(err instanceof Error ? err.message : 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      // Show preview immediately
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Upload file
      uploadImage(file)
    }
  }

  function handlePaste(url: string) {
    setPreviewUrl(url)
    onImageUploaded(url)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-brand-dark mb-2">
        {label}
      </label>

      {/* Preview */}
      {previewUrl && (
        <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden border border-gray-300">
          <Image
            src={previewUrl}
            alt="Preview"
            fill
            className="object-cover"
          />
          <button
            type="button"
            onClick={() => {
              setPreviewUrl('')
              onImageUploaded('')
              if (fileInputRef.current) {
                fileInputRef.current.value = ''
              }
            }}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Upload Options */}
      <div className="space-y-4">
        {/* File Upload */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className={`flex items-center justify-center px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              uploading
                ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                : 'border-brand-teal hover:border-brand-dark hover:bg-brand-cream'
            }`}
          >
            <div className="text-center">
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-teal mx-auto mb-2"></div>
                  <p className="text-sm text-brand-gray">Uploading...</p>
                </>
              ) : (
                <>
                  <svg
                    className="w-8 h-8 mx-auto mb-2 text-brand-gray"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="text-sm text-brand-gray">
                    <span className="font-medium text-brand-teal">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-brand-gray mt-1">PNG, JPG, GIF up to 10MB</p>
                </>
              )}
            </div>
          </label>
        </div>

        {/* OR Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">OR</span>
          </div>
        </div>

        {/* URL Input */}
        <div>
          <input
            type="url"
            placeholder="Paste image URL"
            value={previewUrl}
            onChange={(e) => handlePaste(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent"
          />
          <p className="text-xs text-brand-gray mt-1">
            Or paste a URL from an external source
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
    </div>
  )
}
