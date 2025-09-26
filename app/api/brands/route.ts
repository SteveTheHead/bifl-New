import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: brands, error } = await supabase
      .from('brands')
      .select('id, name, slug, website, description, country, founded_year, is_featured')
      .order('name', { ascending: true })

    if (error) {
      console.error('Brands fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch brands' },
        { status: 500 }
      )
    }

    return NextResponse.json({ brands })
  } catch (error) {
    console.error('Brands API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}