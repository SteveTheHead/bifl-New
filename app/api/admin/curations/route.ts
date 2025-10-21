import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/admin/curations - List all curations
export async function GET() {
  try {
    const supabase = await createClient()

    const { data: curations, error } = await supabase
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
            featured_image_url
          )
        )
      `)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching curations:', error)
      return NextResponse.json(
        { error: 'Failed to fetch curations' },
        { status: 500 }
      )
    }

    return NextResponse.json(curations)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

// POST /api/admin/curations - Create a new curation
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { name, slug, description, featured_image_url, is_active, is_featured, display_order } = body

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    // Insert curation
    const { data: curation, error } = await supabase
      .from('curations')
      .insert({
        name,
        slug,
        description: description || null,
        featured_image_url: featured_image_url || null,
        is_active: is_active !== undefined ? is_active : true,
        is_featured: is_featured !== undefined ? is_featured : false,
        display_order: display_order || 0,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating curation:', error)

      // Check for unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A curation with this slug already exists' },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to create curation' },
        { status: 500 }
      )
    }

    return NextResponse.json(curation, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
