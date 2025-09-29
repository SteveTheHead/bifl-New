import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/lib/ai/service'
import { SYSTEM_PROMPTS, formatProductForAI } from '@/lib/ai/prompts'
import { getProducts, getProductById } from '@/lib/supabase/queries'
import { Database } from '@/lib/supabase/types'

type ProductWithTaxonomy = Database['public']['Views']['products_with_taxonomy']['Row']

interface RecommendationRequest {
  productId?: string          // For "similar to this product" recommendations
  userPreferences?: {         // For personalized recommendations
    categories?: string[]
    priceRange?: [number, number]
    useCase?: string
    priorityFeatures?: string[]
  }
  behaviorData?: {           // User behavior data for better recommendations
    viewedProducts?: string[]
    favoriteProducts?: string[]
    comparedProducts?: string[]
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!aiService.isAvailable()) {
      // Fallback to simple similarity if AI not available
      return await getFallbackRecommendations(request)
    }

    const body: RecommendationRequest = await request.json()
    const { productId, userPreferences, behaviorData } = body

    let recommendations: ProductWithTaxonomy[]

    if (productId) {
      // Product-based recommendations
      recommendations = await getProductBasedRecommendations(productId)
    } else if (userPreferences) {
      // Preference-based recommendations
      recommendations = await getPreferenceBasedRecommendations(userPreferences, behaviorData)
    } else {
      // General trending recommendations
      recommendations = await getTrendingRecommendations()
    }

    return NextResponse.json({
      recommendations,
      type: productId ? 'product-based' : userPreferences ? 'preference-based' : 'trending',
      generated_at: new Date().toISOString()
    })

  } catch (error) {
    console.error('Recommendation error:', error)
    return NextResponse.json({
      error: 'Failed to generate recommendations'
    }, { status: 500 })
  }
}

async function getProductBasedRecommendations(productId: string): Promise<ProductWithTaxonomy[]> {
  const sourceProduct = await getProductById(productId)
  if (!sourceProduct) {
    throw new Error('Product not found')
  }

  const allProducts = await getProducts(0) // Get all products
  const otherProducts = allProducts.filter(p => p.id !== productId)

  // Use AI to find similar products
  const prompt = `Based on this BIFL product, recommend 5-8 similar products that would appeal to the same buyer:

Source Product:
${formatProductForAI(sourceProduct)}

Available Products:
${otherProducts.slice(0, 20).map(p => formatProductForAI(p)).join('\n\n')}

Consider:
- Similar use cases and applications
- Comparable quality and price range
- Same category or complementary categories
- Similar target audience

Return only the product names exactly as they appear, one per line.`

  try {
    const aiResponse = await aiService.generateSimpleText(
      prompt,
      SYSTEM_PROMPTS.RECOMMENDATION_ENGINE
    )

    // Parse AI response and match to actual products
    const recommendedNames = aiResponse
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)

    const matchedProducts = recommendedNames
      .map(name => otherProducts.find(p =>
        p.name?.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(p.name?.toLowerCase() || '')
      ))
      .filter(Boolean)
      .slice(0, 6)

    // If AI didn't find enough matches, supplement with category-based matches
    if (matchedProducts.length < 4) {
      const categoryMatches = otherProducts
        .filter(p => p.category_id === sourceProduct.category_id)
        .sort((a, b) => (b.bifl_total_score || 0) - (a.bifl_total_score || 0))
        .slice(0, 6 - matchedProducts.length)

      matchedProducts.push(...categoryMatches)
    }

    return matchedProducts.slice(0, 6)

  } catch (error) {
    console.error('AI recommendation failed, using fallback:', error)
    // Fallback to category-based recommendations
    return otherProducts
      .filter(p => p.category_id === sourceProduct.category_id)
      .sort((a, b) => (b.bifl_total_score || 0) - (a.bifl_total_score || 0))
      .slice(0, 6)
  }
}

async function getPreferenceBasedRecommendations(
  preferences: RecommendationRequest['userPreferences'],
  behaviorData?: RecommendationRequest['behaviorData']
): Promise<ProductWithTaxonomy[]> {
  const allProducts = await getProducts(0)

  // Filter products based on preferences
  let filteredProducts = allProducts

  if (preferences?.categories && preferences.categories.length > 0) {
    filteredProducts = filteredProducts.filter(p =>
      preferences.categories!.includes(p.category_id || '')
    )
  }

  if (preferences?.priceRange) {
    const [minPrice, maxPrice] = preferences.priceRange
    filteredProducts = filteredProducts.filter(p => {
      const price = parseFloat(p.price || '0')
      return price >= minPrice && price <= maxPrice
    })
  }

  // Use AI for intelligent ranking
  const prompt = `Recommend the best BIFL products for a user with these preferences:

User Preferences:
- Use Case: ${preferences?.useCase || 'General use'}
- Priority Features: ${preferences?.priorityFeatures?.join(', ') || 'Quality and durability'}
- Budget: $${preferences?.priceRange?.[0] || 0} - $${preferences?.priceRange?.[1] || 1000}

${behaviorData?.viewedProducts ? `Previously viewed: ${behaviorData.viewedProducts.length} products` : ''}
${behaviorData?.favoriteProducts ? `Favorited: ${behaviorData.favoriteProducts.length} products` : ''}

Available Products:
${filteredProducts.slice(0, 20).map(p => formatProductForAI(p)).join('\n\n')}

Rank the top 6-8 products for this user, considering their preferences and the product quality scores.
Return only the product names exactly as they appear, one per line.`

  try {
    const aiResponse = await aiService.generateSimpleText(
      prompt,
      SYSTEM_PROMPTS.RECOMMENDATION_ENGINE
    )

    const recommendedNames = aiResponse
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)

    const matchedProducts = recommendedNames
      .map(name => filteredProducts.find(p =>
        p.name?.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(p.name?.toLowerCase() || '')
      ))
      .filter(Boolean)
      .slice(0, 8)

    return matchedProducts.length > 0 ? matchedProducts : getTrendingRecommendations()

  } catch (error) {
    console.error('AI preference recommendation failed:', error)
    return filteredProducts
      .sort((a, b) => (b.bifl_total_score || 0) - (a.bifl_total_score || 0))
      .slice(0, 8)
  }
}

async function getTrendingRecommendations(): Promise<ProductWithTaxonomy[]> {
  const allProducts = await getProducts(0)

  // Simple trending algorithm: highest scored products
  return allProducts
    .sort((a, b) => (b.bifl_total_score || 0) - (a.bifl_total_score || 0))
    .slice(0, 8)
}

async function getFallbackRecommendations(request: NextRequest): Promise<NextResponse> {
  const body = await request.json()
  const { productId } = body

  if (productId) {
    const sourceProduct = await getProductById(productId)
    if (!sourceProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const allProducts = await getProducts(0)
    const similar = allProducts
      .filter(p => p.id !== productId && p.category_id === sourceProduct.category_id)
      .sort((a, b) => (b.bifl_total_score || 0) - (a.bifl_total_score || 0))
      .slice(0, 6)

    return NextResponse.json({
      recommendations: similar,
      type: 'category-based-fallback',
      note: 'AI service not available, using category-based recommendations'
    })
  }

  // General fallback
  const trending = await getTrendingRecommendations()
  return NextResponse.json({
    recommendations: trending,
    type: 'trending-fallback',
    note: 'AI service not available, showing top-rated products'
  })
}