/**
 * Migration script to move FAQ data from products table to product_faqs table
 *
 * This script:
 * 1. Fetches all products with FAQ data (faq_1_q, faq_1_a, etc.)
 * 2. Creates product_faqs records for each FAQ
 * 3. Reports the results
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function migrateFAQs() {
  try {
    console.log('🔄 Starting FAQ migration...\n')

    // Fetch all published products with FAQ data
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select(`
        id,
        name,
        faq_1_q, faq_1_a,
        faq_2_q, faq_2_a,
        faq_3_q, faq_3_a,
        faq_4_q, faq_4_a,
        faq_5_q, faq_5_a
      `)
      .eq('status', 'published')

    if (fetchError) {
      console.error('❌ Error fetching products:', fetchError)
      return
    }

    if (!products || products.length === 0) {
      console.log('⚠️  No products found')
      return
    }

    console.log(`📦 Found ${products.length} products\n`)

    let totalMigrated = 0
    let productsWithFAQs = 0

    for (const product of products) {
      const faqs: any[] = []

      // Collect all FAQs from the product
      for (let i = 1; i <= 5; i++) {
        const questionKey = `faq_${i}_q` as keyof typeof product
        const answerKey = `faq_${i}_a` as keyof typeof product
        const question = product[questionKey]
        const answer = product[answerKey]

        if (question && answer && question.toString().trim() && answer.toString().trim()) {
          faqs.push({
            product_id: product.id,
            question: question.toString().trim(),
            answer: answer.toString().trim(),
            display_order: i,
            is_active: true
          })
        }
      }

      if (faqs.length > 0) {
        productsWithFAQs++

        // Check if FAQs already exist for this product
        const { data: existing } = await supabase
          .from('product_faqs')
          .select('id')
          .eq('product_id', product.id)

        // Delete existing FAQs first
        if (existing && existing.length > 0) {
          await supabase
            .from('product_faqs')
            .delete()
            .eq('product_id', product.id)
        }

        // Insert new FAQs
        const { error: insertError } = await supabase
          .from('product_faqs')
          .insert(faqs)

        if (insertError) {
          console.error(`❌ Error migrating FAQs for "${product.name}":`, insertError.message)
        } else {
          totalMigrated += faqs.length
          console.log(`✅ Migrated ${faqs.length} FAQs for: ${product.name}`)
        }
      }
    }

    console.log('\n🎉 Migration Complete!')
    console.log(`📊 Products with FAQs: ${productsWithFAQs}`)
    console.log(`✅ Total FAQs migrated: ${totalMigrated}`)

  } catch (error) {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  }
}

// Run the migration
migrateFAQs()
