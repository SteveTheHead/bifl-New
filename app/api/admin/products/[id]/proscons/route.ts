import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { Database } from '@/lib/supabase/types'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { pros, cons } = await request.json()
    const supabase = createAdminClient()

    const prosConsData: Database['public']['Tables']['products']['Update'] = {
      pros_cons: {
        pros: pros || [],
        cons: cons || []
      }
    }

    // Type assertion needed due to admin client limitations with typed mutations
    const { error } = await (supabase
      .from('products')
      .update as any)(prosConsData)
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}