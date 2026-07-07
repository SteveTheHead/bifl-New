import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'

// Allow-listed, validated fields (audit H9 pattern): unknown keys are
// rejected so a request body can never set arbitrary columns.
const brandSchema = z
  .object({
    name: z.string().trim().min(1).max(200),
    slug: z
      .string()
      .trim()
      .min(1)
      .max(200)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers, and hyphens'),
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

export async function GET() {
  try {
    const unauthorized = await requireAdmin()
    if (unauthorized) return unauthorized

    const supabase = createAdminClient()
    const { data: brands, error } = await supabase
      .from('brands')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error
    return NextResponse.json({ brands })
  } catch (error) {
    console.error('Error fetching brands:', error)
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const unauthorized = await requireAdmin()
    if (unauthorized) return unauthorized

    const parsed = brandSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid brand data', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data: existing } = await supabase
      .from('brands')
      .select('id')
      .eq('slug', parsed.data.slug)
      .maybeSingle()
    if (existing) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
    }

    const { data: brand, error } = await supabase
      .from('brands')
      .insert(parsed.data)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ brand })
  } catch (error) {
    console.error('Error creating brand:', error)
    return NextResponse.json({ error: 'Failed to create brand' }, { status: 500 })
  }
}
