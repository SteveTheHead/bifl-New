import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Check authentication with Better Auth
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { productIds } = await request.json()

    if (!productIds || !Array.isArray(productIds)) {
      return NextResponse.json({ error: 'Invalid product IDs' }, { status: 400 })
    }

    // Get products by IDs (Supabase is still used for database queries, just not auth)
    const supabase = await createClient()
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
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
    const formattedProducts = products?.map((product: any) => ({
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