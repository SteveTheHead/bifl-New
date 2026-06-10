import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/auth/admin'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const unauthorized = await requireAdmin()
    if (unauthorized) return unauthorized

    const { reviewId } = await params

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