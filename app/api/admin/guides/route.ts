import { createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'

type BuyingGuideInsert = Database['public']['Tables']['buying_guides']['Insert']

async function checkAdminAuth() {
  const cookieStore = await cookies()
  const adminSessionCookie = cookieStore.get('admin-session')

  if (!adminSessionCookie) return false

  try {
    const adminSession = JSON.parse(adminSessionCookie.value)
    // Check if session is still valid (24 hours)
    const sessionAge = Date.now() - (adminSession.loginTime || 0)
    const maxAge = 24 * 60 * 60 * 1000
    return sessionAge <= maxAge
  } catch {
    return false
  }
}

export async function GET() {
  const isAuthenticated = await checkAdminAuth()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createAdminClient()

    const { data: guides, error } = await supabase
      .from('buying_guides')
      .select(`
        id,
        slug,
        title,
        meta_description,
        is_published,
        published_at,
        created_at,
        curation_id,
        curations (name)
      `)
      .order('created_at', { ascending: false })

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

export async function POST(request: NextRequest) {
  const isAuthenticated = await checkAdminAuth()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const supabase = createAdminClient()

    const insertData: BuyingGuideInsert = {
      slug: body.slug,
      title: body.title,
      featured_image_url: body.featured_image_url || null,
      meta_title: body.meta_title,
      meta_description: body.meta_description,
      intro_content: body.intro_content,
      buying_criteria: body.buying_criteria || [],
      faqs: body.faqs || [],
      curation_id: body.curation_id || null,
      category_id: body.category_id || null,
      is_published: body.is_published || false,
      published_at: body.is_published ? new Date().toISOString() : null,
    }

    const { data: guide, error } = await supabase
      .from('buying_guides')
      .insert(insertData as any)
      .select()
      .single()

    if (error) {
      console.error('Error creating guide:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ guide })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
