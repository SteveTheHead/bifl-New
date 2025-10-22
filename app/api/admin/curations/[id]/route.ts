import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/admin/curations/[id] - Get a specific curation
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: curation, error } = await supabase
      .from('curations')
      .select(`
        *,
        curation_products (
          id,
          product_id,
          display_order,
          products (
            id,
            name,
            slug,
            featured_image_url,
            price,
            bifl_total_score
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Curation not found' },
          { status: 404 }
        )
      }

      console.error('Error fetching curation:', error)
      return NextResponse.json(
        { error: 'Failed to fetch curation' },
        { status: 500 }
      )
    }

    return NextResponse.json(curation)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/curations/[id] - Update a curation
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const body = await request.json()

    const { name, slug, description, featured_image_url, is_active, is_featured, display_order } = body

    // Build update object with only provided fields
    const updateData: Record<string, any> = {}
    if (name !== undefined) updateData.name = name
    if (slug !== undefined) updateData.slug = slug
    if (description !== undefined) updateData.description = description
    if (featured_image_url !== undefined) updateData.featured_image_url = featured_image_url
    if (is_active !== undefined) updateData.is_active = is_active
    if (is_featured !== undefined) updateData.is_featured = is_featured
    if (display_order !== undefined) updateData.display_order = display_order

    const { data: curation, error } = await (supabase as any)
      .from('curations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Curation not found' },
          { status: 404 }
        )
      }

      // Check for unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A curation with this slug already exists' },
          { status: 409 }
        )
      }

      console.error('Error updating curation:', error)
      return NextResponse.json(
        { error: 'Failed to update curation' },
        { status: 500 }
      )
    }

    return NextResponse.json(curation)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/curations/[id] - Delete a curation
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { error } = await supabase
      .from('curations')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting curation:', error)
      return NextResponse.json(
        { error: 'Failed to delete curation' },
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
