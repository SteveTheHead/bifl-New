import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkCategoriesAndCOE() {
  const { data, error } = await supabase
    .from('products')
    .select('name, country_of_origin, category_id, categories!category_id(name)')
    .limit(10)

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log('Sample products with categories and COE:\n')
  data?.forEach((product, i) => {
    console.log(`${i+1}. Product: ${product.name}`)
    console.log(`   Country of Origin: ${product.country_of_origin || 'NULL'}`)
    console.log(`   Category: ${(product.categories as any)?.name || 'NULL'}`)
    console.log('')
  })
}

checkCategoriesAndCOE()
