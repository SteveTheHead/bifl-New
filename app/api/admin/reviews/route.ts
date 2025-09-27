import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    console.log('Admin Reviews API: Starting request')

    // Simple admin check - in production you'd want more robust auth
    const cookieHeader = request.headers.get('cookie') || ''
    const isAdmin = cookieHeader.includes('admin-session=admin-authenticated')

    console.log('Admin Reviews API: Cookie check', { cookieHeader, isAdmin })

    if (!isAdmin) {
      console.log('Admin Reviews API: Unauthorized access attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'pending'
    console.log('Admin Reviews API: Filter:', filter)

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

    // Build query based on filter
    let query = supabase
      .from('reviews')
      .select(`
        *,
        products (
          name
        )
      `)
      .order('created_at', { ascending: false })

    // Apply status filter
    if (filter !== 'all') {
      query = query.eq('status', filter)
    }

    const { data, error } = await query

    console.log('Admin Reviews API: Query result', { reviewCount: data?.length || 0, error })

    if (error) {
      console.error('Admin Reviews API: Error fetching reviews:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log('Admin Reviews API: Returning reviews', { count: data?.length || 0 })
    return NextResponse.json({ reviews: data || [] })

  } catch (err) {
    console.error('API: Error:', err)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}