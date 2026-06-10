import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sb } from '@/lib/supabase-utils'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Check authentication with Better Auth
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()

    // Allow-list the fields a reviewer may set. Identity (user_email) comes from
    // the verified session, and moderation/trust fields are forced by the server
    // so a caller cannot self-approve a review or fake a verified purchase.
    const num = (v: unknown) => (v === null || v === undefined || v === '' ? null : Number(v))
    const reviewData = {
      product_id: typeof body.product_id === 'string' ? body.product_id : null,
      user_email: session.user.email, // from session, never the request body
      user_name:
        typeof body.user_name === 'string' ? body.user_name.slice(0, 120) : session.user.name ?? null,
      overall_rating: num(body.overall_rating),
      durability_rating: num(body.durability_rating),
      repairability_rating: num(body.repairability_rating),
      warranty_rating: num(body.warranty_rating),
      value_rating: num(body.value_rating),
      social_rating: num(body.social_rating),
      title: typeof body.title === 'string' ? body.title.slice(0, 200) : null,
      content: typeof body.content === 'string' ? body.content : null,
      pros: Array.isArray(body.pros) ? body.pros.slice(0, 20) : [],
      cons: Array.isArray(body.cons) ? body.cons.slice(0, 20) : [],
      years_owned: num(body.years_owned),
      still_works: typeof body.still_works === 'boolean' ? body.still_works : null,
      would_buy_again: typeof body.would_buy_again === 'boolean' ? body.would_buy_again : null,
      // Server-forced — clients may not set these:
      verified_purchase: false,
      status: 'pending',
    }

    if (!reviewData.product_id) {
      return NextResponse.json({ error: 'product_id is required' }, { status: 400 })
    }
    if (!reviewData.overall_rating) {
      return NextResponse.json({ error: 'A rating is required' }, { status: 400 })
    }

    // The reviews table has no RLS INSERT policy and reviewers authenticate via
    // better-auth (not Supabase), so the service-role client is required here.
    // Safety comes from the allow-list + forced status above, not from RLS.
    const supabase = createAdminClient()
    const { error, data } = await sb.insert(supabase, 'reviews', [reviewData])


    if (error) {
      console.error('API: Insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })

  } catch (err) {
    console.error('API: Error:', err)
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
  }
}