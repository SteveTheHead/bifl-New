import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: products, error } = await supabase
      .from('products')
      .select(`
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
      `)
      .eq('status', 'published')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching products:', error)
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      )
    }

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
