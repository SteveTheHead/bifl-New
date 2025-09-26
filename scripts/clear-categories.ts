import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function clearCategories() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  console.log('🗑️ Deleting old numeric categories...')

  // Clear old categories
  const { error } = await supabase
    .from('categories')
    .delete()
    .gte('display_order', 0) // This will delete all rows

  if (error) {
    console.error('Error:', error)
  } else {
    console.log('✅ Deleted old categories')
  }
}

clearCategories().catch(console.error)