import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { sb } from '@/lib/supabase-utils'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()

    // Add user_id to the review data
    const reviewData = {
      ...body,
      user_id: user.id
    }

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