import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: guides, error } = await supabase
      .from('buying_guides')
      .select(`
        id,
        slug,
        title,
        meta_description,
        featured_image_url,
        is_published,
        published_at,
        created_at,
        categories (name, slug)
      `)
      .eq('is_published', true)
      .order('published_at', { ascending: false })

    if (error) {
      console.error('Error fetching guides:', error)
      return NextResponse.json({ error: 'Failed to fetch guides' }, { status: 500 })
    }

    return NextResponse.json({ guides: guides || [] })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
