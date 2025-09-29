'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSession } from '@/components/auth/auth-client'
import { useFavorites } from '@/lib/hooks/use-favorites'
import Link from 'next/link'
import Image from 'next/image'
import { Sparkles, Star, TrendingUp, Clock, User } from 'lucide-react'

interface Product {
  id: string
  name: string
  slug: string
  brand_name: string
  category_name: string
  featured_image_url: string | null
  bifl_total_score: number | null
  price: number | null
  excerpt: string | null
}

interface RecommendationSection {
  title: string
  icon: React.ReactNode
  products: Product[]
  reason: string
}

export function RecommendationEngine() {
  const { data: session } = useSession()
  const { favorites } = useFavorites()
  const [recommendations, setRecommendations] = useState<RecommendationSection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    generateRecommendations()
  }, [session, favorites, generateRecommendations])

  const generateRecommendations = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const sections: RecommendationSection[] = []

      // 1. Personalized recommendations based on favorites
      if (session?.user && favorites.length > 0) {
        const personalizedRecs = await getPersonalizedRecommendations(favorites)
        if (personalizedRecs.length > 0) {
          sections.push({
            title: 'Recommended for You',
            icon: <User className="w-5 h-5 text-purple-500" />,
            products: personalizedRecs,
            reason: 'Based on your favorite products'
          })
        }
      }

      // 2. Top-rated products (BIFL Legends)
      const { data: topRated } = await supabase
        .from('products_with_taxonomy')
        .select('*')
        .eq('status', 'published')
        .gte('bifl_total_score', 9.0)
        .order('bifl_total_score', { ascending: false })
        .limit(6)

      if (topRated && topRated.length > 0) {
        sections.push({
          title: 'BIFL Legends',
          icon: <Star className="w-5 h-5 text-yellow-500" />,
          products: topRated,
          reason: 'Products with exceptional durability scores (9.0+)'
        })
      }

      // 3. Trending products (most favorited recently)
      const trendingProducts = await getTrendingProducts()
      if (trendingProducts.length > 0) {
        sections.push({
          title: 'Trending Now',
          icon: <TrendingUp className="w-5 h-5 text-green-500" />,
          products: trendingProducts,
          reason: 'Most saved to favorites this week'
        })
      }

      // 4. Recently added high-quality products
      const { data: recentlyAdded } = await supabase
        .from('products_with_taxonomy')
        .select('*')
        .eq('status', 'published')
        .gte('bifl_total_score', 7.5)
        .order('created_at', { ascending: false })
        .limit(6)

      if (recentlyAdded && recentlyAdded.length > 0) {
        sections.push({
          title: 'Fresh Discoveries',
          icon: <Clock className="w-5 h-5 text-blue-500" />,
          products: recentlyAdded,
          reason: 'Recently added high-quality products'
        })
      }

      // 5. AI-powered category recommendations
      const categoryRecs = await getCategoryRecommendations()
      if (categoryRecs.length > 0) {
        sections.push({
          title: 'Explore Categories',
          icon: <Sparkles className="w-5 h-5 text-brand-teal" />,
          products: categoryRecs,
          reason: 'Diverse selection from top-performing categories'
        })
      }

      setRecommendations(sections)
    } catch (error) {
      console.error('Error generating recommendations:', error)
    } finally {
      setLoading(false)
    }
  }, [session, favorites])

  const getPersonalizedRecommendations = async (userFavorites: string[]): Promise<Product[]> => {
    try {
      const supabase = createClient()

      // Get user's favorite products to analyze preferences
      const { data: favoriteProducts } = await supabase
        .from('products_with_taxonomy')
        .select('*')
        .in('id', userFavorites)

      if (!favoriteProducts || favoriteProducts.length === 0) return []

      // Analyze user preferences
      const categoryPreferences = new Map<string, number>()
      const brandPreferences = new Map<string, number>()
      let avgPriceRange = 0
      let avgScorePreference = 0

      favoriteProducts.forEach(product => {
        if (product.category_name) {
          categoryPreferences.set(
            product.category_name,
            (categoryPreferences.get(product.category_name) || 0) + 1
          )
        }
        if (product.brand_name) {
          brandPreferences.set(
            product.brand_name,
            (brandPreferences.get(product.brand_name) || 0) + 1
          )
        }
        if (product.price) avgPriceRange += product.price
        if (product.bifl_total_score) avgScorePreference += product.bifl_total_score
      })

      // avgPriceRange = avgPriceRange / favoriteProducts.length // Unused variable
      avgScorePreference = avgScorePreference / favoriteProducts.length

      // Get top preferred categories and brands
      const topCategories = Array.from(categoryPreferences.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([category]) => category)

      const topBrands = Array.from(brandPreferences.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([brand]) => brand)

      // Find similar products
      const { data: recommendations } = await supabase
        .from('products_with_taxonomy')
        .select('*')
        .eq('status', 'published')
        .not('id', 'in', `(${userFavorites.join(',')})`)
        .or(
          topCategories.map(cat => `category_name.eq.${cat}`).join(',') + ',' +
          topBrands.map(brand => `brand_name.eq.${brand}`).join(',')
        )
        .gte('bifl_total_score', Math.max(avgScorePreference - 1, 6))
        .order('bifl_total_score', { ascending: false })
        .limit(8)

      return recommendations || []
    } catch (error) {
      console.error('Error getting personalized recommendations:', error)
      return []
    }
  }

  const getTrendingProducts = async (): Promise<Product[]> => {
    try {
      const supabase = createClient()

      // This would typically use view count or recent favorites data
      // For now, we'll use products with high scores and recent activity
      const { data: trending } = await supabase
        .from('products_with_taxonomy')
        .select('*')
        .eq('status', 'published')
        .gte('bifl_total_score', 8.0)
        .order('bifl_total_score', { ascending: false })
        .limit(6)

      return trending || []
    } catch (error) {
      console.error('Error getting trending products:', error)
      return []
    }
  }

  const getCategoryRecommendations = async (): Promise<Product[]> => {
    try {
      const supabase = createClient()

      // Get top product from each major category
      const { data: categories } = await supabase
        .from('products_with_taxonomy')
        .select('category_name')
        .eq('status', 'published')
        .not('category_name', 'is', null)

      const categoryCount = new Map<string, number>()
      categories?.forEach(item => {
        if (item.category_name) {
          categoryCount.set(item.category_name, (categoryCount.get(item.category_name) || 0) + 1)
        }
      })

      const topCategories = Array.from(categoryCount.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 6)
        .map(([category]) => category)

      const categoryRecs: Product[] = []

      for (const category of topCategories) {
        const { data: products } = await supabase
          .from('products_with_taxonomy')
          .select('*')
          .eq('status', 'published')
          .eq('category_name', category)
          .order('bifl_total_score', { ascending: false })
          .limit(1)

        if (products && products[0]) {
          categoryRecs.push(products[0])
        }
      }

      return categoryRecs
    } catch (error) {
      console.error('Error getting category recommendations:', error)
      return []
    }
  }

  function getScoreBadgeStyle(score: number | null) {
    if (!score) return {
      className: "score-field px-3 py-1 rounded-full transform transition-all duration-300",
      dataScore: "0"
    }

    const scoreString = score.toString()
    return {
      className: "score-field px-3 py-1 rounded-full transform transition-all duration-300",
      dataScore: scoreString
    }
  }

  if (loading) {
    return (
      <div className="space-y-8 min-h-[400px]">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(j => (
              <div key={j} className="bg-gray-200 rounded-2xl h-64"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {recommendations.map((section, sectionIndex) => (
        <section key={sectionIndex}>
          <div className="flex items-center space-x-3 mb-6">
            {section.icon}
            <div>
              <h2 className="text-2xl font-bold text-brand-dark">{section.title}</h2>
              <p className="text-sm text-brand-gray">{section.reason}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {section.products.slice(0, 6).map((product) => {
              const scoreBadge = getScoreBadgeStyle(product.bifl_total_score)

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-1"
                >
                  {/* Product Image */}
                  <div className="relative aspect-video bg-gray-200">
                    {product.featured_image_url ? (
                      <Image
                        src={product.featured_image_url}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-500">No Image</span>
                      </div>
                    )}

                    {/* BIFL Score Badge */}
                    {product.bifl_total_score && (
                      <div className="absolute top-3 left-3">
                        <div
                          className={`${scoreBadge.className} text-sm font-bold`}
                          data-score={scoreBadge.dataScore}
                        >
                          {product.bifl_total_score.toFixed(1)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-6">
                    <div className="mb-3">
                      <p className="text-sm text-brand-gray mb-1">
                        {product.brand_name} • {product.category_name}
                      </p>
                      <h3 className="font-bold text-lg text-brand-dark line-clamp-2 group-hover:text-brand-teal transition-colors">
                        {product.name}
                      </h3>
                      {product.excerpt && (
                        <p className="text-sm text-brand-gray line-clamp-2 mt-2">
                          {product.excerpt}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-brand-teal font-medium group-hover:underline">
                        View Product →
                      </span>
                      {product.price && (
                        <span className="text-lg font-bold text-brand-dark">
                          ${product.price}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          {section.products.length > 6 && (
            <div className="text-center mt-6">
              <Link
                href={`/products?category=${section.title.toLowerCase().replace(/\s+/g, '-')}`}
                className="inline-flex items-center px-6 py-3 border border-brand-teal text-brand-teal font-medium rounded-lg hover:bg-brand-teal hover:text-white transition-colors"
              >
                View All {section.title}
              </Link>
            </div>
          )}
        </section>
      ))}

      {recommendations.length === 0 && (
        <div className="text-center py-12">
          <Sparkles className="w-16 h-16 text-brand-gray mx-auto mb-4" />
          <h3 className="text-xl font-bold text-brand-dark mb-2">Building Your Recommendations</h3>
          <p className="text-brand-gray">
            Start by favoriting some products to get personalized recommendations!
          </p>
        </div>
      )}
    </div>
  )
}