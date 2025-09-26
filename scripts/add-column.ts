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

async function addColumn() {
  try {
    // Add the optimized_product_description column
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE products ADD COLUMN IF NOT EXISTS optimized_product_description TEXT;'
    })

    if (error) {
      console.error('Error adding column:', error)
      process.exit(1)
    } else {
      console.log('Column optimized_product_description added successfully')
    }
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

addColumn()