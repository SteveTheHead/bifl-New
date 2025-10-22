import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/curations - Get all active curations (public endpoint)
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get('featured')

    let query = supabase
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
        )
      `)
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    // Filter for featured curations if requested
    if (featured === 'true') {
      query = query.eq('is_featured', true)
    }

    const { data: curations, error } = await query

    if (error) {
      console.error('Error fetching curations:', error)
      return NextResponse.json(
        { error: 'Failed to fetch curations' },
        { status: 500 }
      )
    }

    // Sort products within each curation by display_order
    const curationsWithSortedProducts = curations?.map((curation: any) => ({
      ...curation,
      curation_products: curation.curation_products?.sort(
        (a: any, b: any) => a.display_order - b.display_order
      ) || []
    }))

    return NextResponse.json(curationsWithSortedProducts || [])
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
