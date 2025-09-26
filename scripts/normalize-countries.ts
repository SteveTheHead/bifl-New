import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Country normalization mapping
const COUNTRY_NORMALIZATION: Record<string, string> = {
  'USA': 'United States',
  'UK': 'United Kingdom',
  'Great Britain': 'United Kingdom',
  'England': 'United Kingdom'
}

async function normalizeCountries() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  console.log('🌍 Normalizing country names...')

  let updatedCount = 0

  for (const [oldName, newName] of Object.entries(COUNTRY_NORMALIZATION)) {
    const { data, error } = await supabase
      .from('products')
      .update({ country_of_origin: newName })
      .eq('country_of_origin', oldName)
      .select()

    if (error) {
      console.log(`❌ Error updating ${oldName}:`, error.message)
    } else {
      console.log(`✅ Updated ${data?.length || 0} products: "${oldName}" → "${newName}"`)
      updatedCount += data?.length || 0
    }
  }

  console.log(`🎉 Normalized ${updatedCount} country names`)
}

normalizeCountries().catch(console.error)