import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAllProductsForAdmin } from '@/lib/supabase/queries'
import { sb } from '@/lib/supabase-utils'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // First, clean up empty products if requested
    const url = new URL(request.url)
    if (url.searchParams.get('cleanup') === 'true') {
      await supabase
        .from('products')
        .delete()
        .or('name.is.null,name.eq.')

    }

    // Use the new function that includes is_featured
    const products = await getAllProductsForAdmin()

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

    const { data: products, error } = await sb.insert(supabase, 'products', [{
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
      verdict_bullets: body.verdict_bullets || [],
      durability_notes: body.durability_notes,
      repairability_notes: body.repairability_notes,
      sustainability_notes: body.sustainability_notes,
      social_notes: body.social_notes,
      warranty_notes: body.warranty_notes,
      general_notes: body.general_notes,
      meta_title: body.meta_title,
      meta_description: body.meta_description,
      status: body.status || 'draft'
    }])

    if (error) throw error
    const product = products?.[0]

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}