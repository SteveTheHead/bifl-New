import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'

// Same allow-list as the collection route, but every field optional (PATCH
// semantics for PUT). .strict() rejects unknown keys (audit H9 pattern).
const brandUpdateSchema = z
  .object({
    name: z.string().trim().min(1).max(200).optional(),
    slug: z
      .string()
      .trim()
      .min(1)
      .max(200)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers, and hyphens')
      .optional(),
    description: z.string().max(5000).nullable().optional(),
    website: z.string().url().max(500).nullable().optional().or(z.literal('').transform(() => null)),
    country: z.string().max(100).nullable().optional(),
    founded_year: z.number().int().min(1600).max(2100).nullable().optional(),
    warranty_info: z.string().max(5000).nullable().optional(),
    logo_url: z.string().url().max(1000).nullable().optional().or(z.literal('').transform(() => null)),
    is_featured: z.boolean().optional(),
    reputation_score: z.number().min(0).max(10).nullable().optional(),
  })
  .strict()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const unauthorized = await requireAdmin()
    if (unauthorized) return unauthorized

    const { id } = await params
    const supabase = createAdminClient()

    const { data: brand, error } = await supabase
      .from('brands')
      .select('*')
      .eq('id', id)
      .single()

    if (error?.code === 'PGRST116' || !brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
    }
    if (error) throw error

    return NextResponse.json({ brand })
  } catch (error) {
    console.error('Error fetching brand:', error)
    return NextResponse.json({ error: 'Failed to fetch brand' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const unauthorized = await requireAdmin()
    if (unauthorized) return unauthorized

    const { id } = await params
    const parsed = brandUpdateSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid brand data', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    if (parsed.data.slug) {
      const { data: existingSlug } = await supabase
        .from('brands')
        .select('id')
        .eq('slug', parsed.data.slug)
        .neq('id', id)
        .maybeSingle()
      if (existingSlug) {
        return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
      }
    }

    const { data: brand, error } = await supabase
      .from('brands')
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error?.code === 'PGRST116') {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
    }
    if (error) throw error

    return NextResponse.json({ brand })
  } catch (error) {
    console.error('Error updating brand:', error)
    return NextResponse.json({ error: 'Failed to update brand' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const unauthorized = await requireAdmin()
    if (unauthorized) return unauthorized

    const { id } = await params
    const supabase = createAdminClient()

    // Refuse to orphan products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id')
      .eq('brand_id', id)
      .limit(1)
    if (productsError) throw productsError
    if (products && products.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete brand with associated products' },
        { status: 400 }
      )
    }

    const { error } = await supabase.from('brands').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting brand:', error)
    return NextResponse.json({ error: 'Failed to delete brand' }, { status: 500 })
  }
}
