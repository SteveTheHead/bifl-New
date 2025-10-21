// @ts-nocheck
import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status: feedbackStatus } = body

    // Validate status
    const validStatuses = ['new', 'in_review', 'resolved', 'closed']
    if (!feedbackStatus || !validStatuses.includes(feedbackStatus)) {
      return NextResponse.json(
        { message: 'Invalid status value' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('feedback')
      .update({ status: feedbackStatus })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { message: 'Failed to update feedback status' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Status updated successfully', data })
  } catch (error) {
    return NextResponse.json(
      { message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('feedback')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json(
        { message: 'Failed to delete feedback' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Feedback deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
