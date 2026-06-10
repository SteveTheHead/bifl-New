import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { BuyingGuideGenerator, type BuyingGuide } from '@/lib/ai/buying-guide'
import { requireAdmin } from '@/lib/auth/admin'

// Regenerate a category's cached guide at most this often. The whole point is
// to NOT call the LLM on every request — once stored, reads are free.
const FRESH_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

interface CachedGuide {
  guide: BuyingGuide
  productCount: number
}

/** Fetch the category's products, run the LLM, and return the guide + count. */
async function buildGuide(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  category: { id: string; name: string; description: string | null }
): Promise<CachedGuide> {
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select(`
      *,
      brands!inner(name, slug),
      categories!inner(name, slug),
      materials!products_primary_material_id_fkey(name),
      price_ranges(name, min_price, max_price)
    `)
    .eq('category_id', category.id)
    .eq('status', 'published')
    .order('bifl_total_score', { ascending: false })
    .limit(20)

  if (productsError) {
    throw new Error(`Failed to fetch products: ${productsError.message}`)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformedProducts = (products || []).map((product: any) => ({
    ...product,
    brand_name: product.brands?.name,
    brand_slug: product.brands?.slug,
    category_name: product.categories?.name,
    category_slug: product.categories?.slug,
    material_name: product.materials?.name,
    price_range_name: product.price_ranges?.name,
    price_range_min: product.price_ranges?.min_price,
    price_range_max: product.price_ranges?.max_price,
  }))

  const generator = new BuyingGuideGenerator()
  const guide = await generator.generateBuyingGuide(
    category.name,
    category.description,
    transformedProducts
  )

  return { guide, productCount: transformedProducts.length }
}

/** Best-effort persist to the category. Tolerates the columns not existing yet
 *  (pre-migration) so this is safe to deploy in either order. */
async function storeGuide(categoryId: string, cached: CachedGuide): Promise<void> {
  try {
    const admin = createAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (admin as any)
      .from('categories')
      .update({
        buying_guide: cached,
        buying_guide_generated_at: new Date().toISOString(),
      })
      .eq('id', categoryId)
    if (error) {
      // Most likely the migration hasn't run yet — log and carry on uncached.
      console.warn('Buying guide cache write skipped:', error.message)
    }
  } catch (err) {
    console.warn('Buying guide cache write failed:', err)
  }
}

function guideResponse(
  category: { id: string; name: string; slug: string; description: string | null },
  cached: CachedGuide,
  generatedAt: string,
  fromCache: boolean
) {
  return NextResponse.json(
    {
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
      },
      productCount: cached.productCount,
      buyingGuide: cached.guide,
      lastGenerated: generatedAt,
      cached: fromCache,
    },
    {
      // Cheap once cached; let the CDN absorb bursts as defense in depth.
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
    }
  )
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = await createClient()

    const { data: category, error: categoryError } = await (supabase as any)
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single()

    if (categoryError || !category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Serve the stored guide if it exists and is still fresh — no LLM call.
    const stored = category.buying_guide as CachedGuide | null
    const generatedAt = category.buying_guide_generated_at as string | null
    const isFresh =
      stored?.guide &&
      generatedAt &&
      Date.now() - new Date(generatedAt).getTime() < FRESH_MS

    if (isFresh) {
      return guideResponse(category, stored, generatedAt, true)
    }

    // Cache miss / stale / pre-migration: generate once, then persist.
    const cached = await buildGuide(supabase, category)
    await storeGuide(category.id, cached)
    return guideResponse(category, cached, new Date().toISOString(), false)
  } catch (error) {
    console.error('Buying guide API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Admin-only: force a fresh regeneration and update the cache.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // This route lives under /api/categories, so the /api/admin middleware
    // guard does not cover it — verify the signed admin session here.
    const unauthorized = await requireAdmin()
    if (unauthorized) return unauthorized

    const { slug } = await params
    const supabase = await createClient()

    const { data: category, error: categoryError } = await (supabase as any)
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single()

    if (categoryError || !category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const cached = await buildGuide(supabase, category)
    await storeGuide(category.id, cached)
    return guideResponse(category, cached, new Date().toISOString(), false)
  } catch (error) {
    console.error('Buying guide regeneration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
