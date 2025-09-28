import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productIds = searchParams.get('ids')

    if (!productIds) {
      return NextResponse.json({ error: 'Product IDs are required' }, { status: 400 })
    }

    const ids = productIds.split(',').filter(id => id.trim())

    if (ids.length === 0) {
      return NextResponse.json({ error: 'Valid product IDs are required' }, { status: 400 })
    }

    const supabase = await createClient()

    // First, get products basic info
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
        description
      `)
      .in('id', ids)

    if (error) {
      console.error('Error fetching products for comparison:', error)
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }

    // Now get review counts for each product separately
    const productsWithScores = await Promise.all(
      products.map(async (product) => {
        const { data: reviews, error: reviewError } = await supabase
          .from('reviews')
          .select('overall_score')
          .eq('product_id', product.id)
          .eq('status', 'approved')

        let reviewCount = 0
        let averageScore = null

        if (!reviewError && reviews) {
          const scores = reviews.map(r => r.overall_score).filter(s => s !== null && s !== undefined)
          reviewCount = scores.length
          if (scores.length > 0) {
            averageScore = Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10) / 10
          }
        }

        return {
          id: product.id,
          name: product.name,
          price: product.price,
          images: product.featured_image_url ? [product.featured_image_url] : [],
          purchase_url: null, // No purchase URL in database
          average_score: product.bifl_total_score || averageScore,
          review_count: reviewCount,
          durability_score: product.durability_score,
          repairability_score: product.repairability_score,
          warranty_score: product.warranty_score,
          sustainability_score: product.sustainability_score,
          social_score: product.social_score,
          description: product.description
        }
      })
    )

    // Return products in the same order as requested
    const orderedProducts = ids.map(id =>
      productsWithScores.find(product => product.id === id)
    ).filter(Boolean)

    return NextResponse.json({
      products: orderedProducts
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}