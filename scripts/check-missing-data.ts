import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkMissingData() {
  const { data: allProducts } = await supabase
    .from('products_with_taxonomy')
    .select('id, name, brand_name, category_name, featured_image_url')
    .eq('status', 'published')

  console.log('Total products:', allProducts?.length)
  
  const missingName = allProducts?.filter(p => !p.name)
  const missingBrand = allProducts?.filter(p => !p.brand_name)
  const missingCategory = allProducts?.filter(p => !p.category_name)
  
  console.log('\nProducts missing data:')
  console.log('- Missing name:', missingName?.length || 0)
  console.log('- Missing brand_name:', missingBrand?.length || 0)
  console.log('- Missing category_name:', missingCategory?.length || 0)
  
  if (missingName && missingName.length > 0) {
    console.log('\nProducts with no name:', missingName.map(p => p.id))
  }
  if (missingBrand && missingBrand.length > 0) {
    console.log('\nProducts with no brand:', missingBrand.map(p => ({ id: p.id, name: p.name })))
  }
  if (missingCategory && missingCategory.length > 0) {
    console.log('\nProducts with no category:', missingCategory.map(p => ({ id: p.id, name: p.name })))
  }
}

checkMissingData()
