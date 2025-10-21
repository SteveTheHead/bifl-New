import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function findMissingProducts() {
  console.log('Finding the 6 missing products...\n')

  // Fetch exactly as the app does
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
    .limit(10000)

  console.log(`Total products fetched: ${products?.length || 0}\n`)

  // Check for products with any null/undefined critical fields
  const productsWithIssues = products?.filter(p => {
    const issues: string[] = []

    if (!p.id) issues.push('id')
    if (!p.name) issues.push('name')
    if (!p.slug) issues.push('slug')
    if (!p.brand_name) issues.push('brand_name')
    if (!p.category_name) issues.push('category_name')
    if (!p.category_id) issues.push('category_id')

    return issues.length > 0
  })

  if (productsWithIssues && productsWithIssues.length > 0) {
    console.log(`Found ${productsWithIssues.length} products with missing critical fields:\n`)
    productsWithIssues.forEach(p => {
      const issues: string[] = []
      if (!p.id) issues.push('id')
      if (!p.name) issues.push('name')
      if (!p.slug) issues.push('slug')
      if (!p.brand_name) issues.push('brand_name')
      if (!p.category_name) issues.push('category_name')
      if (!p.category_id) issues.push('category_id')

      console.log(`  ❌ ${p.name || 'NO NAME'} (${p.id})`)
      console.log(`     Missing: ${issues.join(', ')}`)
    })
  }

  // Group products by category and count
  const categoryGroups = new Map<string, number>()
  products?.forEach(p => {
    const cat = p.category_name || 'Unknown'
    categoryGroups.set(cat, (categoryGroups.get(cat) || 0) + 1)
  })

  console.log('\nProducts per category:')
  const sortedCategories = Array.from(categoryGroups.entries()).sort((a, b) => b[1] - a[1])
  let totalInCategories = 0
  sortedCategories.forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count}`)
    totalInCategories += count
  })
  console.log(`\nTotal products counted by category: ${totalInCategories}`)
  console.log(`Total products in array: ${products?.length || 0}`)
  console.log(`Difference: ${(products?.length || 0) - totalInCategories}`)
}

findMissingProducts()
