import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function recheckMissingBrands() {
  console.log('Rechecking for products with missing brand_name...\n')

  const { data: allProducts } = await supabase
    .from('products_with_taxonomy')
    .select('id, name, brand_name, category_name')
    .eq('status', 'published')

  console.log('Total published products:', allProducts?.length)

  const missingBrand = allProducts?.filter(p => !p.brand_name || p.brand_name === '')
  const missingCategory = allProducts?.filter(p => !p.category_name || p.category_name === '')
  const missingName = allProducts?.filter(p => !p.name || p.name === '')

  console.log('\nProducts with missing data:')
  console.log('- Missing brand_name:', missingBrand?.length || 0)
  console.log('- Missing category_name:', missingCategory?.length || 0)
  console.log('- Missing name:', missingName?.length || 0)

  if (missingBrand && missingBrand.length > 0) {
    console.log('\n❌ Products missing brand_name:')
    missingBrand.forEach(p => {
      console.log(`  - ${p.name} (${p.id})`)
    })
  } else {
    console.log('\n✅ All products have brand_name')
  }

  if (missingCategory && missingCategory.length > 0) {
    console.log('\n❌ Products missing category_name:')
    missingCategory.forEach(p => {
      console.log(`  - ${p.name} (${p.id})`)
    })
  }
}

recheckMissingBrands()
