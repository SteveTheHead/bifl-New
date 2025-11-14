import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const { reviewId } = await params

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

    const body = await request.json()
    const { action } = body

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

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

    // Update the review status
    const newStatus = action === 'approve' ? 'approved' : 'rejected'
    const { data, error } = await supabase
      .from('reviews')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', reviewId)
      .select()

    if (error) {
      console.error('API: Error updating review:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      review: data[0],
      message: `Review ${action}d successfully`
    })

  } catch (err) {
    console.error('API: Error:', err)
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
  }
}