import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const feedbackType = searchParams.get('feedback_type')

    const supabase = createAdminClient()

    let query = supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false })

    // Apply filters if provided
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (feedbackType && feedbackType !== 'all') {
      query = query.eq('feedback_type', feedbackType)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching feedback:', error)
      return NextResponse.json(
        { message: 'Failed to fetch feedback' },
        { status: 500 }
      )
    }

    return NextResponse.json({ feedback: data })
  } catch (error) {
    console.error('Feedback fetch error:', error)
    return NextResponse.json(
      { message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
