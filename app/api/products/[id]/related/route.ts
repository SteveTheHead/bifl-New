import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // First get the current product to understand its category
    const { data: currentProduct, error: currentError } = await supabase
      .from('products')
      .select('category_id, price')
      .eq('id', id)
      .single()

    if (currentError || !currentProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Find related products in the same category, excluding the current product
    // Prioritize products with similar price range
    const priceRange = parseFloat(currentProduct.price) || 0
    const lowerBound = priceRange * 0.5 // 50% lower
    const upperBound = priceRange * 2.0 // 100% higher

    const { data: relatedProducts, error } = await supabase
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
        category_id
      `)
      .eq('category_id', currentProduct.category_id)
      .neq('id', id)
      .gte('price', lowerBound.toString())
      .lte('price', upperBound.toString())
      .order('bifl_total_score', { ascending: false })
      .limit(2)

    if (error) {
      console.error('Error fetching related products:', error)
      return NextResponse.json({ error: 'Failed to fetch related products' }, { status: 500 })
    }

    // If we don't have enough products in the price range, get any from the same category
    if (relatedProducts.length < 2) {
      const { data: fallbackProducts, error: fallbackError } = await supabase
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
          category_id
        `)
        .eq('category_id', currentProduct.category_id)
        .neq('id', id)
        .order('bifl_total_score', { ascending: false })
        .limit(2)

      if (!fallbackError && fallbackProducts) {
        return NextResponse.json({
          products: fallbackProducts.slice(0, 2)
        })
      }
    }

    return NextResponse.json({
      products: relatedProducts.slice(0, 2)
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}