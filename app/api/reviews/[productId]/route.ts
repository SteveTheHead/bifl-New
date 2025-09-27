import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params
    console.log('API: Fetching reviews for product:', productId)

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

    // Only show approved reviews
    const statusFilter = ['approved']

    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .in('status', statusFilter)
      .order('created_at', { ascending: false })

    console.log('API: Reviews query result:', { data: data?.length || 0, error })

    if (error) {
      console.error('API: Error fetching reviews:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ reviews: data || [] })

  } catch (err) {
    console.error('API: Error:', err)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}