import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAllProductsForAdmin } from '@/lib/supabase/queries'
import { sb } from '@/lib/supabase-utils'
import { requireAdmin } from '@/lib/auth/admin'
import { productWriteSchema } from '@/lib/validation/product'

export async function GET(request: NextRequest) {
  try {
    const unauthorized = await requireAdmin()
    if (unauthorized) return unauthorized

    const supabase = await createClient()

    // First, clean up empty products if requested
    const url = new URL(request.url)
    if (url.searchParams.get('cleanup') === 'true') {
      await supabase
        .from('products')
        .delete()
        .or('name.is.null,name.eq.')

    }

    // Use the new function that includes is_featured
    const products = await getAllProductsForAdmin()

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const unauthorized = await requireAdmin()
    if (unauthorized) return unauthorized

    const parsed = productWriteSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid product data', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }
    if (!parsed.data.name || !parsed.data.slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: products, error } = await sb.insert(supabase, 'products', [
      { status: 'draft', ...parsed.data },
    ])

    if (error) throw error
    const product = products?.[0]

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}