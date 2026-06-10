import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/auth/admin'

export async function GET() {
  try {
    const unauthorized = await requireAdmin()
    if (unauthorized) return unauthorized

    // Use service role key to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Fetch all subscribers
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching subscribers:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Get counts
    const counts = {
      total: data?.length || 0,
      subscribed: data?.filter(s => s.subscribed).length || 0,
      unsubscribed: data?.filter(s => !s.subscribed).length || 0
    }

    return NextResponse.json({
      subscribers: data || [],
      counts
    })

  } catch (err) {
    console.error('API: Error:', err)
    return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 })
  }
}
