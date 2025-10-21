import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { Database } from '@/lib/supabase/types'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { productId, careData, faqs, proscons } = body

    const supabase = createAdminClient()

    // Handle care data update
    if (careData) {
      const updateData: Database['public']['Tables']['products']['Update'] = {
        care_and_maintenance: careData
      }
      // Type assertion needed due to admin client limitations with typed mutations
      const { data, error } = await (supabase
        .from('products')
        .update as any)(updateData)
        .eq('id', productId)
        .select()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, data })
    }

    // Handle pros/cons update
    if (proscons) {
      const updateData: Database['public']['Tables']['products']['Update'] = {
        pros_cons: proscons
      }
      // Type assertion needed due to admin client limitations with typed mutations
      const { data, error } = await (supabase
        .from('products')
        .update as any)(updateData)
        .eq('id', productId)
        .select()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, data })
    }

    // Handle FAQ inserts
    if (faqs && Array.isArray(faqs)) {
      const faqsToInsert: Database['public']['Tables']['product_faqs']['Insert'][] = faqs.map(faq => ({
        product_id: productId,
        question: faq.question,
        answer: faq.answer,
        display_order: faq.display_order || 0
      }))

      // Type assertion needed due to admin client limitations with typed mutations
      const { data, error } = await (supabase
        .from('product_faqs')
        .insert as any)(faqsToInsert)
        .select()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, data })
    }

    return NextResponse.json({ error: 'No data provided' }, { status: 400 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}