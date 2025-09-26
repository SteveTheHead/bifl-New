import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function checkBrandMetadata() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  console.log('🏷️ Checking brand metadata in products...')

  // Get products with brand-related fields
  const { data: products, error } = await supabase
    .from('products')
    .select('name, slug, brand_id, wordpress_meta')
    .limit(10)

  if (error) {
    console.error('Error fetching products:', error)
    return
  }

  console.log('\n📦 Sample products with brand info:')
  products?.forEach((product, index) => {
    console.log(`${index + 1}. "${product.name}"`)
    console.log(`   Slug: ${product.slug}`)
    console.log(`   Brand ID: ${product.brand_id}`)
    console.log(`   WordPress Meta: ${JSON.stringify(product.wordpress_meta, null, 2)}`)
    console.log('---')
  })

  // Check if we can extract brand from slug or name
  console.log('\n🔍 Analyzing brand extraction from slugs:')
  products?.forEach((product) => {
    const slugParts = product.slug?.split('-') || []
    const possibleBrand = slugParts[0]
    console.log(`${product.name} → Brand from slug: "${possibleBrand}"`)
  })
}

checkBrandMetadata().catch(console.error)