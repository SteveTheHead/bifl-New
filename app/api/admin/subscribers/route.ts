import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    // Check admin session cookie
    const cookieHeader = request.headers.get('cookie') || ''
    const adminSessionMatch = cookieHeader.match(/admin-session=([^;]+)/)

    if (!adminSessionMatch) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      const adminSession = JSON.parse(decodeURIComponent(adminSessionMatch[1]))

      // Check if session is still valid (24 hours)
      const sessionAge = Date.now() - (adminSession.loginTime || 0)
      const maxAge = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

      if (sessionAge > maxAge) {
        return NextResponse.json({ error: 'Session expired' }, { status: 401 })
      }
    } catch (parseError) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

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
