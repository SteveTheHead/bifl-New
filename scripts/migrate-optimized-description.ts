import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function migrateOptimizedDescription() {
  console.log('Starting migration of optimized_product_description...\n')

  // Get all products where optimized_product_description is NULL but excerpt is not NULL
  const { data: products, error: fetchError } = await supabase
    .from('products')
    .select('id, name, excerpt, optimized_product_description')
    .is('optimized_product_description', null)
    .not('excerpt', 'is', null)

  if (fetchError) {
    console.error('Error fetching products:', fetchError)
    return
  }

  if (!products || products.length === 0) {
    console.log('No products need migration.')
    return
  }

  console.log(`Found ${products.length} products to migrate\n`)

  let successCount = 0
  let errorCount = 0

  // Update each product
  for (const product of products) {
    const { error: updateError } = await supabase
      .from('products')
      .update({ optimized_product_description: product.excerpt })
      .eq('id', product.id)

    if (updateError) {
      console.error(`❌ Error updating product ${product.name}:`, updateError)
      errorCount++
    } else {
      console.log(`✅ Updated: ${product.name}`)
      successCount++
    }
  }

  console.log(`\nMigration complete!`)
  console.log(`Success: ${successCount}`)
  console.log(`Errors: ${errorCount}`)
}

migrateOptimizedDescription()
