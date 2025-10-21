import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDuplicates() {
  console.log('Checking for duplicate products...\n')

  const { data: products } = await supabase
    .from('products_with_taxonomy')
    .select('id, name, brand_name')
    .eq('status', 'published')
    .order('bifl_total_score', { ascending: false })

  if (!products) {
    console.log('No products found')
    return
  }

  console.log(`Total products fetched: ${products.length}`)

  // Check for duplicate IDs
  const idMap = new Map()
  const duplicateIds: string[] = []

  products.forEach(p => {
    if (idMap.has(p.id)) {
      duplicateIds.push(p.id)
    } else {
      idMap.set(p.id, p)
    }
  })

  if (duplicateIds.length > 0) {
    console.log(`\n❌ Found ${duplicateIds.length} duplicate product IDs:`)
    duplicateIds.forEach(id => {
      console.log(`  - ${id}`)
    })
  } else {
    console.log('\n✅ No duplicate product IDs found')
  }

  // Count unique products
  const uniqueProducts = new Set(products.map(p => p.id))
  console.log(`\nUnique products: ${uniqueProducts.size}`)
  console.log(`Total in array: ${products.length}`)
  console.log(`Duplicates: ${products.length - uniqueProducts.size}`)
}

checkDuplicates()
