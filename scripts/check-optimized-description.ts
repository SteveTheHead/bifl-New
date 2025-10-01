import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkOptimizedDescription() {
  const { data, error } = await supabase
    .from('products')
    .select('name, optimized_product_description, excerpt, description')
    .limit(5)

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log('Sample products with optimized_product_description:\n')
  data?.forEach((product, i) => {
    console.log(`${i+1}. Product: ${product.name}`)
    console.log(`   optimized_product_description: ${product.optimized_product_description ? product.optimized_product_description.substring(0, 100) + '...' : 'NULL'}`)
    console.log(`   excerpt: ${product.excerpt ? product.excerpt.substring(0, 100) + '...' : 'NULL'}`)
    console.log('')
  })
}

checkOptimizedDescription()
