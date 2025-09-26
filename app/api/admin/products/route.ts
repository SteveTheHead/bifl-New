import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: products, error } = await supabase
      .from('products_with_taxonomy')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) throw error

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = await createClient()

    const { data: product, error } = await supabase
      .from('products')
      .insert([{
        name: body.name,
        slug: body.slug,
        brand_id: body.brand_id,
        category_id: body.category_id,
        excerpt: body.excerpt,
        description: body.description,
        price: body.price,
        featured_image_url: body.featured_image_url,
        bifl_total_score: body.bifl_total_score,
        status: body.status || 'draft'
      }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}