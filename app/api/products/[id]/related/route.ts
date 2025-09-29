import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // First get the current product with all details for intelligent matching
    const { data: currentProduct, error: currentError } = await supabase
      .from('products_with_taxonomy')
      .select('*')
      .eq('id', id)
      .single()

    if (currentError || !currentProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Extract keywords from the current product for intelligent matching
    const productName = currentProduct.name || ''
    const brandName = currentProduct.brand_name || ''
    const categoryName = currentProduct.category_name || ''
    // const description = currentProduct.description || '' // Unused variable

    // Create search keywords from product name, removing common words
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', '&']
    const nameWords = productName.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.includes(word))

    const brandWords = brandName.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.includes(word))

    const categoryWords = categoryName.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.includes(word))

    // Get all potential related products (excluding current product)
    const { data: allProducts, error } = await supabase
      .from('products_with_taxonomy')
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
        category_id,
        brand_name,
        category_name,
        description
      `)
      .eq('status', 'published')
      .neq('id', id)

    if (error) {
      console.error('Error fetching potential related products:', error)
      return NextResponse.json({ error: 'Failed to fetch related products' }, { status: 500 })
    }

    // Calculate relevance scores for each product using the same logic as search
    const productsWithScores = allProducts.map(product => {
      const productNameLower = (product.name || '').toLowerCase()
      const productBrandLower = (product.brand_name || '').toLowerCase()
      const productCategoryLower = (product.category_name || '').toLowerCase()
      const productDescriptionLower = (product.description || '').toLowerCase()

      let relevanceScore = 0

      // Score based on name word matches
      nameWords.forEach(word => {
        if (productNameLower.includes(word)) {
          relevanceScore += 5 // High score for name matches
        } else if (productDescriptionLower.includes(word)) {
          relevanceScore += 2 // Medium score for description matches
        }
      })

      // Score based on brand matches
      brandWords.forEach(word => {
        if (productBrandLower.includes(word)) {
          relevanceScore += 4 // High score for brand matches
        }
      })

      // Score based on category matches
      categoryWords.forEach(word => {
        if (productCategoryLower.includes(word)) {
          relevanceScore += 3 // Good score for category matches
        }
      })

      // Bonus for exact same category
      if (product.category_id === currentProduct.category_id) {
        relevanceScore += 3
      }

      // Bonus for same brand
      if (product.brand_name === currentProduct.brand_name) {
        relevanceScore += 4
      }

      // Price similarity bonus (within 50% range gets bonus)
      const currentPrice = parseFloat(currentProduct.price) || 0
      const productPrice = parseFloat(product.price) || 0
      if (currentPrice > 0 && productPrice > 0) {
        const priceDiff = Math.abs(currentPrice - productPrice) / currentPrice
        if (priceDiff <= 0.5) {
          relevanceScore += 2 // Bonus for similar price range
        }
      }

      // Quality score bonus (prioritize higher quality products)
      const qualityScore = product.bifl_total_score || 0
      if (qualityScore >= 8.0) {
        relevanceScore += 2
      } else if (qualityScore >= 7.0) {
        relevanceScore += 1
      }

      return {
        ...product,
        relevanceScore
      }
    })

    // Sort by relevance score (highest first), then by BIFL score as tiebreaker
    const sortedProducts = productsWithScores
      .filter(product => product.relevanceScore > 0) // Only include products with some relevance
      .sort((a, b) => {
        if (b.relevanceScore !== a.relevanceScore) {
          return b.relevanceScore - a.relevanceScore
        }
        // Tiebreaker: higher BIFL score wins
        return (b.bifl_total_score || 0) - (a.bifl_total_score || 0)
      })

    // If we don't have enough relevant products, fall back to same category products
    let finalProducts = sortedProducts.slice(0, 2)

    if (finalProducts.length < 2) {
      const categoryFallback = allProducts
        .filter(product =>
          product.category_id === currentProduct.category_id &&
          !finalProducts.some(fp => fp.id === product.id)
        )
        .sort((a, b) => (b.bifl_total_score || 0) - (a.bifl_total_score || 0))
        .slice(0, 2 - finalProducts.length)

      finalProducts = [...finalProducts, ...categoryFallback]
    }

    // Remove the relevanceScore from the response
    const cleanProducts = finalProducts.map(({ relevanceScore: _relevanceScore, ...product }) => product)

    return NextResponse.json({
      products: cleanProducts.slice(0, 2)
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}