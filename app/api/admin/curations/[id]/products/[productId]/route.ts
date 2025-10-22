import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// DELETE /api/admin/curations/[id]/products/[productId] - Remove a product from a curation
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; productId: string }> }
) {
  try {
    const { id: curationId, productId } = await params
    const supabase = await createClient()

    const { error } = await supabase
      .from('curation_products')
      .delete()
      .eq('curation_id', curationId)
      .eq('product_id', productId)

    if (error) {
      console.error('Error removing product from curation:', error)
      return NextResponse.json(
        { error: 'Failed to remove product from curation' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/curations/[id]/products/[productId] - Update product display order
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; productId: string }> }
) {
  try {
    const { id: curationId, productId } = await params
    const supabase = await createClient()
    const body = await request.json()

    const { display_order } = body

    if (display_order === undefined) {
      return NextResponse.json(
        { error: 'display_order is required' },
        { status: 400 }
      )
    }

    const { data, error } = await (supabase as any)
      .from('curation_products')
      .update({ display_order })
      .eq('curation_id', curationId)
      .eq('product_id', productId)
      .select()
      .single()

    if (error) {
      console.error('Error updating product order:', error)
      return NextResponse.json(
        { error: 'Failed to update product order' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
