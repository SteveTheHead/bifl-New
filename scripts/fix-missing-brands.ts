import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const productBrands = [
  { id: '46307c4f-a865-41a3-b62c-f2fb0c103dd4', brand: 'Merkur' },
  { id: '61ab45fb-61c1-4406-8a08-901ff3925218', brand: 'FELCO' },
  { id: 'df0a5a75-bf92-4dcd-9c7d-0345dd845770', brand: 'YETI' },
  { id: '3917e4ac-ba01-4ea1-b390-321471be6e97', brand: 'YETI' },
  { id: '8b8dcd53-e1e5-4751-8c2b-d53d71999630', brand: 'YETI' },
  { id: '4148697a-f940-4016-a1c0-0c061cb7d5dd', brand: 'DEWALT' },
]

async function fixBrands() {
  for (const product of productBrands) {
    // Get brand ID
    const { data: brand } = await supabase
      .from('brands')
      .select('id')
      .eq('name', product.brand)
      .single()

    if (!brand) {
      console.log(`Brand not found: ${product.brand}`)
      continue
    }

    // Update product
    const { error } = await supabase
      .from('products')
      .update({ brand_id: brand.id })
      .eq('id', product.id)

    if (error) {
      console.error(`Error updating product ${product.id}:`, error)
    } else {
      console.log(`✓ Updated product ${product.id} with brand ${product.brand}`)
    }
  }
  
  console.log('\nDone! All products updated.')
}

fixBrands()
