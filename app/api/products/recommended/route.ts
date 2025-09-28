import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
        warranty_score,
        sustainability_score,
        social_score,
        brand_id,
        category_id,
        created_at,
        brands(name)
      `)
      .eq('status', 'published')
      .not('bifl_total_score', 'is', null)
      .order('bifl_total_score', { ascending: false })
      .limit(12)

    if (error) {
      console.error('Error fetching recommended products:', error)
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