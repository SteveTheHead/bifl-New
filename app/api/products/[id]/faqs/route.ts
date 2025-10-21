import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
// import * as cheerio from 'cheerio' // Unused import
import { Database } from '@/lib/supabase/types'

type Product = Database['public']['Tables']['products']['Row']

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Try to get product details first to check if the product exists
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Fetch FAQs for this product
    const { data: faqs, error } = await supabase
      .from('product_faqs')
      .select('*')
      .eq('product_id', id)
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) {
      // If table doesn't exist or there's a relation error, return clean generated FAQs
      const defaultFAQs = generateDefaultFAQs(product)
      return NextResponse.json({ faqs: defaultFAQs })
    }

    // If no FAQs exist for this product, return clean generated FAQs
    if (!faqs || faqs.length === 0) {
      const defaultFAQs = generateDefaultFAQs(product)
      return NextResponse.json({ faqs: defaultFAQs })
    }

    return NextResponse.json({ faqs })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function generateDefaultFAQs(product: Product) {
  return [
    {
      id: '1',
      question: 'How long does this product typically last?',
      answer: product.lifespan_expectation
        ? `Based on user reviews and testing, this product typically lasts ${product.lifespan_expectation} years with proper care and maintenance.`
        : 'This product is built to last many years with proper care and maintenance.',
      display_order: 1
    },
    {
      id: '2',
      question: 'Is this product repairable?',
      answer: (() => {
        const score = product.repairability_score || 0
        if (score >= 8) return 'Yes, this product is highly repairable with readily available parts and service documentation.'
        if (score >= 6) return 'Yes, this product can be repaired, though some specialized knowledge may be required.'
        if (score >= 4) return 'Partial repairability - some components can be fixed but others may require professional service.'
        return 'Limited repairability - most issues require professional service or replacement.'
      })(),
      display_order: 2
    },
    {
      id: '3',
      question: 'What warranty does this product come with?',
      answer: product.warranty_years
        ? `This product comes with a ${product.warranty_years}-year warranty covering manufacturing defects.`
        : 'Please check with the manufacturer for specific warranty information.',
      display_order: 3
    },
    {
      id: '4',
      question: 'Where is this product made?',
      answer: product.country_of_origin
        ? `This product is manufactured in ${product.country_of_origin}.`
        : 'Please check with the manufacturer for country of origin information.',
      display_order: 4
    },
    {
      id: '5',
      question: 'How does this product compare to similar items?',
      answer: `This product scores ${product.bifl_total_score ? product.bifl_total_score.toFixed(1) : 'well'} in our BIFL rating system, taking into account durability, repairability, warranty, and social factors. Check our comparison section for detailed analysis against similar products.`,
      display_order: 5
    }
  ]
}


// Removed unused cleanText function