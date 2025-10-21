import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { status } = body

    // Validate status
    const validStatuses = ['new', 'in_review', 'resolved', 'closed']
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { message: 'Invalid status value' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('feedback')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating feedback:', error)
      return NextResponse.json(
        { message: 'Failed to update feedback status' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Status updated successfully', data })
  } catch (error) {
    console.error('Feedback update error:', error)
    return NextResponse.json(
      { message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('feedback')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting feedback:', error)
      return NextResponse.json(
        { message: 'Failed to delete feedback' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Feedback deleted successfully' })
  } catch (error) {
    console.error('Feedback delete error:', error)
    return NextResponse.json(
      { message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
