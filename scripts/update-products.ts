import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function updateProducts() {
  try {
    // First, get all products to see their structure
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, name, verdict_summary')
      .limit(1)

    if (fetchError) {
      console.error('Error fetching products:', fetchError)
      return
    }

    console.log('Sample product structure:', products?.[0])

    // Check if optimized_product_description column exists by trying to select it
    const { data: testColumn, error: columnError } = await supabase
      .from('products')
      .select('optimized_product_description')
      .limit(1)

    if (columnError && columnError.code === 'PGRST116') {
      console.log('optimized_product_description column does not exist')
      console.log('Column needs to be added manually via Supabase dashboard or SQL editor')
      console.log('SQL: ALTER TABLE products ADD COLUMN optimized_product_description TEXT;')
    } else {
      console.log('optimized_product_description column exists')
    }

  } catch (error) {
    console.error('Error:', error)
  }
}

updateProducts()