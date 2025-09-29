import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { Database } from '@/utils/supabase/types'
import type { SupabaseClient } from '@supabase/supabase-js'
import { sb } from '@/lib/supabase-utils'

type SupabaseClientType = SupabaseClient<Database>
type Review = Database['public']['Tables']['reviews']['Row']
type Product = Database['public']['Tables']['products']['Row']

export async function GET() {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    let recommendedProducts = []

    if (user && !authError && user.email) {
      // Get user's personalized recommendations
      recommendedProducts = await getPersonalizedRecommendations(supabase, user.email)
    }

    // If no personalized recommendations or user not logged in, fall back to top-rated
    if (recommendedProducts.length === 0) {
      recommendedProducts = await getTopRatedProducts(supabase)
    }

    return NextResponse.json({
      products: recommendedProducts,
      personalized: user ? true : false
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function getPersonalizedRecommendations(supabase: SupabaseClientType, userEmail: string) {
  try {
    // 1. Get user's favorite products to analyze their preferences
    const { data: favorites, error: favError } = await sb.select(
      supabase,
      'user_favorites',
      `
        product_id,
        products!inner(
          category_id,
          brand_id,
          bifl_total_score
        )
      `
    ).eq('user_email', userEmail)

    // 2. Get user's reviews to analyze deeper preferences
    const { data: userReviews, error: reviewError } = await sb.select(
      supabase,
      'reviews',
      `
        product_id,
        overall_rating,
        durability_rating,
        repairability_rating,
        warranty_rating,
        value_rating,
        pros,
        cons,
        content,
        products!inner(
          category_id,
          brand_id,
          bifl_total_score
        )
      `
    )
      .eq('user_email', userEmail)
      .eq('status', 'approved')

    // If neither favorites nor reviews exist, fall back to general recommendations
    if ((favError || !favorites || favorites.length === 0) &&
        (reviewError || !userReviews || userReviews.length === 0)) {
      return []
    }

    // 3. Analyze user preferences from favorites and reviews
    const allUserProducts = [
      ...(favorites || []).map((f: any) => ({
        product_id: f.product_id,
        category_id: f.products?.category_id,
        brand_id: f.products?.brand_id,
        bifl_total_score: f.products?.bifl_total_score,
        source: 'favorite'
      })),
      ...(userReviews || []).map((r: any) => ({
        product_id: r.product_id,
        category_id: r.products?.category_id,
        brand_id: r.products?.brand_id,
        bifl_total_score: r.products?.bifl_total_score,
        overall_rating: r.overall_rating,
        durability_rating: r.durability_rating,
        repairability_rating: r.repairability_rating,
        warranty_rating: r.warranty_rating,
        value_rating: r.value_rating,
        pros: r.pros,
        cons: r.cons,
        content: r.content,
        source: 'review'
      }))
    ]

    // 4. Extract insights from user behavior
    const userProductIds = [...new Set(allUserProducts.map(p => p.product_id))]
    const preferredCategories = [...new Set(allUserProducts.map(p => p.category_id).filter(Boolean))]
    const preferredBrands = [...new Set(allUserProducts.map(p => p.brand_id).filter(Boolean))]

    // 5. Analyze review patterns for priority scoring
    const userPriorities = analyzeUserPriorities(userReviews || [])

    // 6. Build smart recommendation query based on user preferences
    const baseQuery = sb.select(
      supabase,
      'products',
      `
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
      `
    )
      .eq('status', 'published')
      .not('bifl_total_score', 'is', null)
      .not('id', 'in', `(${userProductIds.join(',')})`) // Exclude already interacted products

    // 7. Get category-based recommendations with smart scoring
    const { data: categoryRecommendations, error: catError } = await baseQuery
      .in('category_id', preferredCategories.length > 0 ? preferredCategories : [null])
      .order('bifl_total_score', { ascending: false })
      .limit(8)

    if (catError) {
      console.error('Error fetching category recommendations:', catError)
      return []
    }

    let recommendations = categoryRecommendations || []

    // 8. Add brand-based recommendations if needed
    if (recommendations.length < 6 && preferredBrands.length > 0) {
      const { data: brandRecommendations, error: brandError } = await sb.select(
        supabase,
        'products',
        `
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
        `
      )
        .eq('status', 'published')
        .not('bifl_total_score', 'is', null)
        .not('id', 'in', `(${userProductIds.join(',')})`)
        .in('brand_id', preferredBrands)
        .not('id', 'in', `(${recommendations.map((p: any) => p.id).join(',') || 'null'})`)
        .order('bifl_total_score', { ascending: false })
        .limit(4)

      if (!brandError && brandRecommendations) {
        recommendations = [...recommendations, ...brandRecommendations]
      }
    }

    // 9. Apply intelligent scoring based on user priorities
    const scoredRecommendations = recommendations.map((product: any) => ({
      ...product,
      personalized_score: calculatePersonalizedScore(product, userPriorities)
    }))

    // 10. Sort by personalized score and format
    const sortedRecommendations = scoredRecommendations
      .sort((a: any, b: any) => b.personalized_score - a.personalized_score)
      .map((product: any) => ({
        ...product,
        brand_name: product.brands?.name || null
      }))

    return sortedRecommendations.slice(0, 12) // Limit to 12 recommendations

  } catch (error) {
    console.error('Error getting personalized recommendations:', error)
    return []
  }
}

async function getTopRatedProducts(supabase: SupabaseClientType) {
  try {
    const { data: products, error } = await sb.select(
      supabase,
      'products',
      `
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
      `
    )
      .eq('status', 'published')
      .not('bifl_total_score', 'is', null)
      .order('bifl_total_score', { ascending: false })
      .limit(12)

    if (error) {
      console.error('Error fetching top-rated products:', error)
      return []
    }

    // Format products with brand name
    return products?.map((product: any) => ({
      ...product,
      brand_name: product.brands?.name || null
    })) || []

  } catch (error) {
    console.error('Error getting top-rated products:', error)
    return []
  }
}

// Analyze user's review patterns to understand their priorities
function analyzeUserPriorities(userReviews: any[]) {
  if (!userReviews || userReviews.length === 0) {
    return {
      durability: 1.0,
      repairability: 1.0,
      warranty: 1.0,
      value: 1.0,
      overall_preference: 1.0
    }
  }

  // Calculate average ratings to understand what user values most
  const ratings = {
    durability: userReviews.filter(r => r.durability_rating).map(r => r.durability_rating),
    repairability: userReviews.filter(r => r.repairability_rating).map(r => r.repairability_rating),
    warranty: userReviews.filter(r => r.warranty_rating).map(r => r.warranty_rating),
    value: userReviews.filter(r => r.value_rating).map(r => r.value_rating),
    overall: userReviews.filter(r => r.overall_rating).map(r => r.overall_rating)
  }

  // Calculate averages and determine priorities
  const avgRatings = {
    durability: ratings.durability.length > 0 ? ratings.durability.reduce((a, b) => a + b, 0) / ratings.durability.length : 3,
    repairability: ratings.repairability.length > 0 ? ratings.repairability.reduce((a, b) => a + b, 0) / ratings.repairability.length : 3,
    warranty: ratings.warranty.length > 0 ? ratings.warranty.reduce((a, b) => a + b, 0) / ratings.warranty.length : 3,
    value: ratings.value.length > 0 ? ratings.value.reduce((a, b) => a + b, 0) / ratings.value.length : 3,
    overall: ratings.overall.length > 0 ? ratings.overall.reduce((a, b) => a + b, 0) / ratings.overall.length : 3
  }

  // Higher ratings indicate higher user priorities
  // Normalize to create weight factors (higher rating = higher priority weight)
  const maxRating = Math.max(...Object.values(avgRatings))
  const minRating = Math.min(...Object.values(avgRatings))
  const range = maxRating - minRating || 1

  return {
    durability: 0.5 + (avgRatings.durability - minRating) / range * 0.5, // 0.5 to 1.0
    repairability: 0.5 + (avgRatings.repairability - minRating) / range * 0.5,
    warranty: 0.5 + (avgRatings.warranty - minRating) / range * 0.5,
    value: 0.5 + (avgRatings.value - minRating) / range * 0.5,
    overall_preference: avgRatings.overall / 5 // 0.0 to 1.0 based on overall satisfaction
  }
}

// Calculate personalized score for a product based on user priorities
function calculatePersonalizedScore(product: any, userPriorities: ReturnType<typeof analyzeUserPriorities>) {
  const baseScore = product.bifl_total_score || 0

  // Apply user priority weights to different aspects
  const weightedScore =
    (product.durability_score || baseScore) * userPriorities.durability * 0.3 +
    (product.repairability_score || baseScore) * userPriorities.repairability * 0.25 +
    (product.warranty_score || baseScore) * userPriorities.warranty * 0.25 +
    baseScore * userPriorities.overall_preference * 0.2

  // Boost score slightly to differentiate from base BIFL score
  return weightedScore * 1.1
}