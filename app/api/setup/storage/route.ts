import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = createAdminClient()


    // Check if bucket exists
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      console.error('List buckets error:', listError)
      return NextResponse.json({
        error: 'Failed to list buckets',
        details: listError.message
      }, { status: 500 })
    }


    const bucketExists = existingBuckets?.some(bucket => bucket.name === 'user-uploads')

    if (bucketExists) {
      return NextResponse.json({
        success: true,
        message: 'Storage bucket already exists',
        buckets: existingBuckets?.map(b => b.name)
      })
    }


    // Create the bucket with admin permissions
    const { data, error } = await supabase.storage.createBucket('user-uploads', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
      fileSizeLimit: 5242880 // 5MB
    })

    if (error) {
      console.error('Error creating bucket:', error)

      // Try a simpler bucket creation approach
      const { data: simpleData, error: simpleError } = await supabase.storage.createBucket('user-uploads', {
        public: true
      })

      if (simpleError) {
        console.error('Simple bucket creation also failed:', simpleError)
        return NextResponse.json({
          error: 'Failed to create storage bucket',
          details: `Primary error: ${error.message}, Fallback error: ${simpleError.message}`
        }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'Storage bucket created successfully (simple)',
        bucket: simpleData
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Storage bucket created successfully',
      bucket: data
    })

  } catch (error) {
    console.error('Storage setup error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}