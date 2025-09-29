import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { productId, careData, faqs, proscons } = body

    const supabase = await createClient()

    // Handle care data update
    if (careData) {
      const { data, error } = await supabase
        .from('products')
        .update({ care_and_maintenance: careData })
        .eq('id', productId)
        .select()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, data })
    }

    // Handle pros/cons update
    if (proscons) {
      const { data, error } = await supabase
        .from('products')
        .update({ pros_cons: proscons })
        .eq('id', productId)
        .select()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, data })
    }

    // Handle FAQ inserts
    if (faqs && Array.isArray(faqs)) {
      const faqsToInsert = faqs.map(faq => ({
        product_id: productId,
        question: faq.question,
        answer: faq.answer,
        display_order: faq.display_order || 0
      }))

      const { data, error } = await supabase
        .from('product_faqs')
        .insert(faqsToInsert)
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