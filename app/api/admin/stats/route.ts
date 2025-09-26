import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get counts for different entities
    const [
      { count: totalProducts },
      { count: totalCategories },
      { count: totalBrands },
      { count: totalReviews }
    ] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('categories').select('*', { count: 'exact', head: true }),
      supabase.from('brands').select('*', { count: 'exact', head: true }),
      supabase.from('reviews').select('*', { count: 'exact', head: true })
    ])

    // Get average BIFL score
    const { data: avgScoreData } = await supabase
      .from('products')
      .select('bifl_total_score')
      .not('bifl_total_score', 'is', null)

    const avgBiflScore = avgScoreData?.length
      ? avgScoreData.reduce((sum, item) => sum + (item.bifl_total_score || 0), 0) / avgScoreData.length
      : 0

    // Get new products this week
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const { count: newProductsThisWeek } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', oneWeekAgo.toISOString())

    return NextResponse.json({
      totalProducts: totalProducts || 0,
      totalCategories: totalCategories || 0,
      totalBrands: totalBrands || 0,
      totalReviews: totalReviews || 0,
      avgBiflScore: avgBiflScore || 0,
      newProductsThisWeek: newProductsThisWeek || 0
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}