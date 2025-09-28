import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({
        error: 'Not authenticated',
        bucketExists: 'unknown'
      })
    }

    // Check if bucket exists
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()

    const bucketExists = buckets?.some(bucket => bucket.name === 'user-uploads')

    return NextResponse.json({
      authenticated: true,
      userId: user.id,
      bucketExists,
      buckets: buckets?.map(b => b.name) || [],
      error: bucketError?.message || null
    })

  } catch (error) {
    return NextResponse.json({
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}