import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSerialization() {
  console.log('Checking for products with serialization issues...\n')

  const { data: products } = await supabase
    .from('products_with_taxonomy')
    .select(`
      id,
      name,
      slug,
      brand_name,
      category_name,
      category_id,
      country_of_origin,
      featured_image_url,
      bifl_total_score,
      bifl_certification,
      price,
      status,
      is_featured,
      use_case,
      excerpt,
      durability_score,
      repairability_score,
      warranty_score,
      sustainability_score,
      social_score
    `)
    .eq('status', 'published')
    .order('bifl_total_score', { ascending: false })

  console.log(`Total products fetched: ${products?.length || 0}\n`)

  // Try to serialize each product and catch any errors
  const problematicProducts: any[] = []

  products?.forEach((product, index) => {
    try {
      JSON.stringify(product)
    } catch (e) {
      problematicProducts.push({ index, id: product.id, name: product.name, error: e })
    }
  })

  if (problematicProducts.length > 0) {
    console.log(`❌ Found ${problematicProducts.length} products with serialization issues:`)
    problematicProducts.forEach(p => {
      console.log(`  - ${p.name} (${p.id}): ${p.error}`)
    })
  } else {
    console.log('✅ All products can be serialized')
  }

  // Check for products with null/undefined required fields
  const productsWithMissingFields = products?.filter(p =>
    !p.name || !p.id || !p.slug
  )

  if (productsWithMissingFields && productsWithMissingFields.length > 0) {
    console.log(`\n❌ Found ${productsWithMissingFields.length} products with missing required fields:`)
    productsWithMissingFields.forEach(p => {
      console.log(`  - ${p.name || 'NO NAME'} (${p.id}): missing ${!p.name ? 'name ' : ''}${!p.slug ? 'slug' : ''}`)
    })
  }

  // Try to serialize the whole array
  try {
    const serialized = JSON.stringify(products)
    const parsed = JSON.parse(serialized)
    console.log(`\n✅ Full array serialization successful`)
    console.log(`Original length: ${products?.length}`)
    console.log(`Parsed length: ${parsed.length}`)
  } catch (e) {
    console.log(`\n❌ Full array serialization failed: ${e}`)
  }
}

checkSerialization()
