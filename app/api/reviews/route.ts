import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('API: Received review data:', body)

    // Use service role key to bypass RLS for development
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { error, data } = await supabase
      .from('reviews')
      .insert(body)
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