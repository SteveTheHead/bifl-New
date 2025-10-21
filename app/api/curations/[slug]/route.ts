import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/curations/[slug] - Get a specific active curation by slug (public endpoint)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
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
            excerpt,
            featured_image_url,
            price,
            bifl_total_score,
            star_rating,
            brand:brands (
              name,
              slug
            ),
            category:categories (
              name,
              slug
            )
          )
        )
      `)
      .eq('slug', slug)
      .eq('is_active', true)
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

    // Sort products by display_order
    const curationWithSortedProducts = {
      ...curation,
      curation_products: curation.curation_products?.sort(
        (a: any, b: any) => a.display_order - b.display_order
      ) || []
    }

    return NextResponse.json(curationWithSortedProducts)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
