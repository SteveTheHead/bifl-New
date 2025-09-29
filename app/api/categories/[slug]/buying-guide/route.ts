import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { BuyingGuideGenerator } from '@/lib/ai/buying-guide'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = await createClient()

    // Get category details
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single()

    if (categoryError || !category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Get products in this category with related data
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        *,
        brands!inner(name, slug),
        categories!inner(name, slug),
        materials(name),
        price_ranges(name, min_price, max_price)
      `)
      .eq('category_id', category.id)
      .eq('status', 'published')
      .order('bifl_total_score', { ascending: false })
      .limit(20)

    if (productsError) {
      console.error('Error fetching products:', productsError)
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }

    // Transform products data for AI
    const transformedProducts = (products || []).map(product => ({
      ...product,
      brand_name: product.brands?.name,
      brand_slug: product.brands?.slug,
      category_name: product.categories?.name,
      category_slug: product.categories?.slug,
      material_name: product.materials?.name,
      price_range_name: product.price_ranges?.name,
      price_range_min: product.price_ranges?.min_price,
      price_range_max: product.price_ranges?.max_price
    }))

    // Generate buying guide using AI
    const generator = new BuyingGuideGenerator()
    const buyingGuide = await generator.generateBuyingGuide(
      category.name,
      category.description,
      transformedProducts
    )

    // Return the buying guide with category and product context
    return NextResponse.json({
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description
      },
      productCount: transformedProducts.length,
      buyingGuide,
      lastGenerated: new Date().toISOString()
    })

  } catch (error) {
    console.error('Buying guide API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Allow POST for admin regeneration
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Check admin authentication
    const adminSession = request.cookies.get('admin-session')
    if (!adminSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Regenerate the buying guide (same logic as GET)
    return GET(request, { params })

  } catch (error) {
    console.error('Buying guide regeneration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}