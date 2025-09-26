import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function checkPriceData() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  console.log('💰 Checking price data in products...')

  // Get products with price info
  const { data: products, error } = await supabase
    .from('products')
    .select('name, price, price_range_id')
    .limit(20)

  if (error) {
    console.error('Error fetching products:', error)
    return
  }

  console.log('\n📦 Sample products with price info:')
  products?.forEach((product, index) => {
    console.log(`${index + 1}. "${product.name}"`)
    console.log(`   Price: ${product.price}`)
    console.log(`   Price Range ID: ${product.price_range_id}`)
    console.log('---')
  })

  // Get price statistics
  const { data: priceStats } = await supabase
    .from('products')
    .select('price')
    .not('price', 'is', null)
    .order('price', { ascending: true })

  if (priceStats && priceStats.length > 0) {
    const prices = priceStats.map(p => parseFloat(p.price)).filter(p => !isNaN(p))
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length

    console.log(`\n📊 Price Statistics:`)
    console.log(`   Total products with prices: ${prices.length}`)
    console.log(`   Min price: $${minPrice}`)
    console.log(`   Max price: $${maxPrice}`)
    console.log(`   Average price: $${avgPrice.toFixed(2)}`)
  }
}

checkPriceData().catch(console.error)