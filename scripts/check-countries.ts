import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function checkCountries() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  console.log('🌍 Checking country of origin data...')

  // Get unique countries from products
  const { data: products, error } = await supabase
    .from('products')
    .select('country_of_origin')
    .not('country_of_origin', 'is', null)

  if (error) {
    console.error('Error fetching countries:', error)
    return
  }

  // Get unique countries and count occurrences
  const countryCounts = products?.reduce((acc: Record<string, number>, product) => {
    const country = product.country_of_origin?.trim()
    if (country) {
      acc[country] = (acc[country] || 0) + 1
    }
    return acc
  }, {})

  console.log('\n📊 Countries found:')
  Object.entries(countryCounts || {})
    .sort(([,a], [,b]) => b - a)
    .forEach(([country, count]) => {
      console.log(`${country}: ${count} products`)
    })

  console.log(`\n📈 Total products with country data: ${products?.length || 0}`)
}

checkCountries().catch(console.error)