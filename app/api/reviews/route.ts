import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    console.log('API: Received review data:', body)

    // Add user_id to the review data
    const reviewData = {
      ...body,
      user_id: user.id
    }

    const { error, data } = await supabase
      .from('reviews')
      .insert(reviewData)
      .select()

    console.log('API: Insert result:', { data, error })

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