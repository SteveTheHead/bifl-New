import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params
    const supabase = await createClient()

    // Fetch approved reviews that have pros or cons
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('pros, cons')
      .eq('product_id', productId)
      .eq('status', 'approved')
      .or('pros.not.is.null,cons.not.is.null')

    if (error) {
      console.error('Error fetching reviews:', error)
      return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
    }

    // Aggregate all pros and cons
    const allPros: string[] = []
    const allCons: string[] = []

    reviews.forEach(review => {
      if (review.pros && Array.isArray(review.pros)) {
        review.pros.forEach(pro => {
          if (pro && typeof pro === 'string' && pro.trim()) {
            allPros.push(pro.trim())
          }
        })
      }

      if (review.cons && Array.isArray(review.cons)) {
        review.cons.forEach(con => {
          if (con && typeof con === 'string' && con.trim()) {
            allCons.push(con.trim())
          }
        })
      }
    })

    // Count frequency of each pro/con to prioritize most mentioned ones
    const prosCount: Record<string, number> = {}
    const consCount: Record<string, number> = {}

    allPros.forEach(pro => {
      const normalized = pro.toLowerCase()
      prosCount[normalized] = (prosCount[normalized] || 0) + 1
    })

    allCons.forEach(con => {
      const normalized = con.toLowerCase()
      consCount[normalized] = (consCount[normalized] || 0) + 1
    })

    // Get most mentioned pros and cons (keep original casing from first mention)
    const topPros: string[] = []
    const topCons: string[] = []

    // Create a map to store the original casing for each normalized string
    const prosOriginalText: Record<string, string> = {}
    const consOriginalText: Record<string, string> = {}

    allPros.forEach(pro => {
      const normalized = pro.toLowerCase()
      if (!prosOriginalText[normalized]) {
        prosOriginalText[normalized] = pro
      }
    })

    allCons.forEach(con => {
      const normalized = con.toLowerCase()
      if (!consOriginalText[normalized]) {
        consOriginalText[normalized] = con
      }
    })

    // Sort by frequency and take top items
    Object.entries(prosCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8) // Top 8 pros
      .forEach(([normalized]) => {
        topPros.push(prosOriginalText[normalized])
      })

    Object.entries(consCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8) // Top 8 cons
      .forEach(([normalized]) => {
        topCons.push(consOriginalText[normalized])
      })

    return NextResponse.json({
      pros: topPros,
      cons: topCons,
      reviewCount: reviews.length
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}