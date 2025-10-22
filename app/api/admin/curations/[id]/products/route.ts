import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST /api/admin/curations/[id]/products - Add products to a curation
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: curationId } = await params
    const supabase = await createClient()
    const body = await request.json()

    const { product_ids, display_order } = body

    // Validate input
    if (!product_ids || !Array.isArray(product_ids) || product_ids.length === 0) {
      return NextResponse.json(
        { error: 'product_ids must be a non-empty array' },
        { status: 400 }
      )
    }

    // Verify curation exists
    const { data: curation, error: curationError } = await supabase
      .from('curations')
      .select('id')
      .eq('id', curationId)
      .single()

    if (curationError || !curation) {
      return NextResponse.json(
        { error: 'Curation not found' },
        { status: 404 }
      )
    }

    // Prepare inserts
    const inserts = product_ids.map((productId, index) => ({
      curation_id: curationId,
      product_id: productId,
      display_order: display_order !== undefined ? display_order + index : index,
    }))

    // Insert curation products
    const { data: curationProducts, error } = await (supabase as any)
      .from('curation_products')
      .insert(inserts)
      .select(`
        *,
        products (
          id,
          name,
          slug,
          featured_image_url,
          price,
          bifl_total_score
        )
      `)

    if (error) {
      console.error('Error adding products to curation:', error)

      // Check for duplicate entry
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'One or more products are already in this curation' },
          { status: 409 }
        )
      }

      // Check for foreign key violation
      if (error.code === '23503') {
        return NextResponse.json(
          { error: 'One or more product IDs are invalid' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to add products to curation' },
        { status: 500 }
      )
    }

    return NextResponse.json(curationProducts, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

// GET /api/admin/curations/[id]/products - Get products in a curation
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: curationId } = await params
    const supabase = await createClient()

    const { data: curationProducts, error } = await supabase
      .from('curation_products')
      .select(`
        *,
        products (
          id,
          name,
          slug,
          featured_image_url,
          price,
          bifl_total_score,
          brand:brands (
            name,
            slug
          ),
          category:categories (
            name,
            slug
          )
        )
      `)
      .eq('curation_id', curationId)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching curation products:', error)
      return NextResponse.json(
        { error: 'Failed to fetch curation products' },
        { status: 500 }
      )
    }

    return NextResponse.json(curationProducts)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
