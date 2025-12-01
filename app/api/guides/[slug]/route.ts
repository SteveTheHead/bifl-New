import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = await createClient()

    // Fetch the buying guide
    const { data: guide, error: guideError } = await supabase
      .from('buying_guides')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single()

    if (guideError || !guide) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 })
    }

    const guideData = guide as any

    // If guide has a linked curation, fetch the products
    let products: any[] = []
    if (guideData.curation_id) {
      const { data: curationProducts } = await supabase
        .from('curation_products')
        .select(`
          id,
          display_order,
          products (
            id,
            name,
            slug,
            excerpt,
            featured_image_url,
            price,
            bifl_total_score,
            durability_score,
            repairability_score,
            warranty_score,
            sustainability_score,
            social_score,
            bifl_certification,
            brand_id,
            brands!brand_id (name, slug)
          )
        `)
        .eq('curation_id', guideData.curation_id)
        .order('display_order', { ascending: true })

      if (curationProducts) {
        products = curationProducts.map((cp: any) => ({
          ...cp.products,
          brand: cp.products.brands,
          display_order: cp.display_order
        }))
      }
    }

    return NextResponse.json({
      ...guideData,
      products
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
