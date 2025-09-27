import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const productId = params.id

    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single()

    if (error) throw error

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const supabase = await createClient()
    const productId = params.id

    const { data: product, error } = await supabase
      .from('products')
      .update({
        name: body.name,
        slug: body.slug,
        brand_id: body.brand_id,
        category_id: body.category_id,
        excerpt: body.excerpt,
        description: body.description,
        price: body.price,
        featured_image_url: body.featured_image_url,
        gallery_images: body.gallery_images || [],
        bifl_total_score: body.bifl_total_score,
        durability_score: body.durability_score,
        repairability_score: body.repairability_score,
        sustainability_score: body.sustainability_score,
        social_score: body.social_score,
        warranty_score: body.warranty_score,
        dimensions: body.dimensions,
        weight: body.weight,
        lifespan_expectation: body.lifespan_expectation,
        warranty_years: body.warranty_years,
        country_of_origin: body.country_of_origin,
        use_case: body.use_case,
        affiliate_link: body.affiliate_link,
        manufacturer_link: body.manufacturer_link,
        verdict_summary: body.verdict_summary,
        meta_title: body.meta_title,
        meta_description: body.meta_description,
        status: body.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const productId = params.id

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}