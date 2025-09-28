import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { productIds } = await request.json()

    if (!productIds || !Array.isArray(productIds)) {
      return NextResponse.json({ error: 'Invalid product IDs' }, { status: 400 })
    }

    // Get products by IDs
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        price,
        featured_image_url,
        bifl_total_score,
        durability_score,
        repairability_score,
        warranty_score,
        sustainability_score,
        social_score,
        brand_id,
        category_id,
        created_at,
        affiliate_link,
        brands(name)
      `)
      .in('id', productIds)
      .eq('status', 'published')

    if (error) {
      console.error('Error fetching favorite products:', error)
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }

    // Format products with brand name
    const formattedProducts = products?.map(product => ({
      ...product,
      brand_name: product.brands?.name || null
    })) || []

    return NextResponse.json({
      products: formattedProducts
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}