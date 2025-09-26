import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Country code mapping - common codes based on the data
const COUNTRY_CODE_MAP: Record<string, string> = {
  '201': 'United States',
  '202': 'Canada',
  '203': 'Mexico',
  '204': 'China',
  '205': 'Japan',
  '206': 'South Korea',
  '207': 'Taiwan',
  '1476': 'Germany',
  '1520': 'United Kingdom',
  '1566': 'Italy',
  '1567': 'France',
  '1569': 'Sweden',
  '1572': 'Denmark',
  '1573': 'Norway',
  '1574': 'Finland',
  '1575': 'Netherlands',
  '1590': 'Switzerland',
  '1591': 'Austria'
}

async function fixCountryNames() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  console.log('🌍 Fixing country names from codes to proper names...')

  // Get all products with country codes
  const { data: products, error } = await supabase
    .from('products')
    .select('id, country_of_origin')
    .not('country_of_origin', 'is', null)

  if (error) {
    console.error('Error fetching products:', error)
    return
  }

  let updatedCount = 0
  let unknownCodes = new Set<string>()

  for (const product of products || []) {
    const code = product.country_of_origin?.trim()
    const countryName = COUNTRY_CODE_MAP[code]

    if (countryName) {
      const { error: updateError } = await supabase
        .from('products')
        .update({ country_of_origin: countryName })
        .eq('id', product.id)

      if (updateError) {
        console.log(`❌ Failed to update product ${product.id}:`, updateError.message)
      } else {
        console.log(`✅ Updated code "${code}" → "${countryName}"`)
        updatedCount++
      }
    } else {
      unknownCodes.add(code)
    }
  }

  console.log(`\n🎉 Updated ${updatedCount} country names`)

  if (unknownCodes.size > 0) {
    console.log(`\n❓ Unknown country codes found:`)
    Array.from(unknownCodes).forEach(code => {
      console.log(`   "${code}"`)
    })
  }
}

fixCountryNames().catch(console.error)