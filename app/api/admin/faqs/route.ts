import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { productId, faqs } = await request.json()
    const supabase = await createClient()

    // Delete existing FAQs for this product
    await supabase
      .from('product_faqs')
      .delete()
      .eq('product_id', productId)

    // Insert new FAQs
    if (faqs && faqs.length > 0) {
      const faqsToInsert = faqs.map((faq: any, index: number) => ({
        product_id: productId,
        question: faq.question,
        answer: faq.answer,
        display_order: index + 1,
        is_active: faq.is_active ?? true
      }))

      const { error } = await supabase
        .from('product_faqs')
        .insert(faqsToInsert)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}