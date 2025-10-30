import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
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

    // Add user_id and user_email to the review data
    const reviewData = {
      ...body,
      user_id: session.user.id,
      user_email: session.user.email
    }

    const supabase = await createClient()
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