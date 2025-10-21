import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Temporary debug endpoint to check reviews
export async function GET() {
  try {

    // Use service role key to bypass RLS
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

    // Get all reviews with status
    const { data, error } = await supabase
      .from('reviews')
      .select('id, status, title, user_email, created_at')
      .order('created_at', { ascending: false })


    if (error) {
      console.error('Debug Reviews API: Error fetching reviews:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      reviews: data || [],
      statusCounts: {
        pending: data?.filter(r => r.status === 'pending').length || 0,
        approved: data?.filter(r => r.status === 'approved').length || 0,
        rejected: data?.filter(r => r.status === 'rejected').length || 0,
        total: data?.length || 0
      }
    })

  } catch (err) {
    console.error('Debug Reviews API: Error:', err)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}