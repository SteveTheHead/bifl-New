import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function debugProducts() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  console.log('🔍 Debugging product data...')

  // Get first 10 products to see their structure
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .limit(10)

  if (error) {
    console.error('Error fetching products:', error)
    return
  }

  console.log(`\n📦 Found ${products?.length || 0} products (showing first 10):`)
  products?.forEach((product, index) => {
    console.log(`${index + 1}. Name: "${product.name}"`)
    console.log(`   Slug: "${product.slug}"`)
    console.log(`   Category ID: ${product.category_id}`)
    console.log(`   All fields:`, Object.keys(product))
    console.log('---')
  })

  // Also check total count
  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })

  console.log(`\n📊 Total products in database: ${count}`)

  // Check categories
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .limit(5)

  console.log(`\n📂 Categories (first 5):`)
  categories?.forEach((cat, index) => {
    console.log(`${index + 1}. "${cat.name}" (slug: "${cat.slug}", id: ${cat.id})`)
  })
}

debugProducts().catch(console.error)