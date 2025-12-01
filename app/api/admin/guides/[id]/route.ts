import { createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuthenticated = await checkAdminAuth()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const supabase = createAdminClient()

    const { data: guide, error } = await supabase
      .from('buying_guides')
      .select(`
        id,
        slug,
        title,
        featured_image_url,
        meta_title,
        meta_description,
        intro_content,
        buying_criteria,
        faqs,
        is_published,
        published_at,
        created_at,
        curation_id,
        curations (id, name, slug)
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Guide not found' }, { status: 404 })
      }
      console.error('Error fetching guide:', error)
      return NextResponse.json({ error: 'Failed to fetch guide' }, { status: 500 })
    }

    return NextResponse.json({ guide })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuthenticated = await checkAdminAuth()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const supabase = createAdminClient()

    // Build update object
    const updateData: Record<string, unknown> = {
      slug: body.slug,
      title: body.title,
      featured_image_url: body.featured_image_url || null,
      meta_title: body.meta_title,
      meta_description: body.meta_description,
      intro_content: body.intro_content,
      buying_criteria: body.buying_criteria || [],
      faqs: body.faqs || [],
      curation_id: body.curation_id || null,
      is_published: body.is_published || false,
      updated_at: new Date().toISOString(),
    }

    // Set published_at when publishing for the first time
    if (body.is_published && !body.was_published) {
      updateData.published_at = new Date().toISOString()
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: guide, error } = await (supabase as any)
      .from('buying_guides')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating guide:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ guide })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuthenticated = await checkAdminAuth()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('buying_guides')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting guide:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
