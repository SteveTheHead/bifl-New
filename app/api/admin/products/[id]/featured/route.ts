import { NextRequest, NextResponse } from 'next/server'
import { toggleProductFeatured } from '@/lib/supabase/queries'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { is_featured } = body
    const { id } = await params


    const product = await toggleProductFeatured(id, is_featured)

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Error updating featured status:', error)
    return NextResponse.json(
      { error: 'Failed to update featured status' },
      { status: 500 }
    )
  }
}