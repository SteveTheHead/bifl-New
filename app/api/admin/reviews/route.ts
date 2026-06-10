import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/auth/admin'

export async function GET(request: NextRequest) {
  try {
    const unauthorized = await requireAdmin()
    if (unauthorized) return unauthorized

    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'pending'

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

    if (error) {
      console.error('Admin Reviews API: Error fetching reviews:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Get counts for all statuses
    const { data: countData } = await supabase
      .from('reviews')
      .select('status', { count: 'exact', head: false })

    const counts = {
      pending: countData?.filter(r => r.status === 'pending').length || 0,
      approved: countData?.filter(r => r.status === 'approved').length || 0,
      rejected: countData?.filter(r => r.status === 'rejected').length || 0,
      all: countData?.length || 0
    }

    return NextResponse.json({
      reviews: data || [],
      counts
    })

  } catch (err) {
    console.error('API: Error:', err)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}