import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkView() {
  console.log('Checking products_with_taxonomy view...\n')

  // Count products in the view
  const { data: viewProducts, error } = await supabase
    .from('products_with_taxonomy')
    .select('id, name, brand_name')
    .eq('status', 'published')

  console.log('Total products in view:', viewProducts?.length)

  // Check if any have missing brand_name
  const missingBrand = viewProducts?.filter(p => !p.brand_name)
  console.log('Products with missing brand_name:', missingBrand?.length)

  if (missingBrand && missingBrand.length > 0) {
    console.log('\nProducts still missing brand_name:')
    missingBrand.forEach(p => {
      console.log(`  - ${p.name} (${p.id})`)
    })
  }

  // Check the specific 6 products we just updated
  const updatedIds = [
    '46307c4f-a865-41a3-b62c-f2fb0c103dd4',
    '61ab45fb-61c1-4406-8a08-901ff3925218',
    'df0a5a75-bf92-4dcd-9c7d-0345dd845770',
    '3917e4ac-ba01-4ea1-b390-321471be6e97',
    '8b8dcd53-e1e5-4751-8c2b-d53d71999630',
    '4148697a-f940-4016-a1c0-0c061cb7d5dd'
  ]

  console.log('\nChecking the 6 recently updated products in the view:')
  for (const id of updatedIds) {
    const product = viewProducts?.find(p => p.id === id)
    if (product) {
      console.log(`  ✓ ${product.name}: brand_name = "${product.brand_name}"`)
    } else {
      console.log(`  ❌ Product ${id} not found in view`)
    }
  }

  // Also check directly from products table
  console.log('\nChecking same products directly from products table:')
  const { data: directProducts } = await supabase
    .from('products')
    .select('id, name, brand_id')
    .in('id', updatedIds)

  directProducts?.forEach(p => {
    console.log(`  - ${p.name}: brand_id = "${p.brand_id}"`)
  })
}

checkView()
