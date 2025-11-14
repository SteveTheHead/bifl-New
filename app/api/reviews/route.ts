import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sb } from '@/lib/supabase-utils'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Check authentication with Better Auth
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()

    // Add user_email to the review data (reviews table uses user_email, not user_id)
    const reviewData = {
      ...body,
      user_email: session.user.email
    }

    // Log the data being sent to help debug
    console.log('Review data being inserted:', JSON.stringify(reviewData, null, 2))

    // Use admin client to bypass RLS
    const supabase = createAdminClient()
    const { error, data } = await sb.insert(supabase, 'reviews', [reviewData])


    if (error) {
      console.error('API: Insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })

  } catch (err) {
    console.error('API: Error:', err)
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
  }
}