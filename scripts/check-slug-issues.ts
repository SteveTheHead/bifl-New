import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSlugIssues() {
  console.log('Checking for products with slug issues...\n')

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

  console.log(`Total products: ${products?.length || 0}\n`)

  // Check for products with null/empty slug
  const noSlug = products?.filter(p => !p.slug || p.slug === '')
  console.log(`Products with missing slug: ${noSlug?.length || 0}`)
  if (noSlug && noSlug.length > 0) {
    noSlug.forEach(p => {
      console.log(`  - ${p.name} (${p.id})`)
    })
  }

  // Check for duplicate slugs
  const slugMap = new Map<string, number>()
  products?.forEach(p => {
    if (p.slug) {
      slugMap.set(p.slug, (slugMap.get(p.slug) || 0) + 1)
    }
  })
  const duplicateSlugs = Array.from(slugMap.entries()).filter(([_, count]) => count > 1)
  console.log(`\nProducts with duplicate slugs: ${duplicateSlugs.length}`)
  if (duplicateSlugs.length > 0) {
    duplicateSlugs.forEach(([slug, count]) => {
      console.log(`  - "${slug}": ${count} products`)
      const dupes = products?.filter(p => p.slug === slug)
      dupes?.forEach(p => {
        console.log(`    • ${p.name} (${p.id})`)
      })
    })
  }

  // Check for null bifl_total_score
  const noScore = products?.filter(p => p.bifl_total_score === null || p.bifl_total_score === undefined)
  console.log(`\nProducts with null bifl_total_score: ${noScore?.length || 0}`)
  if (noScore && noScore.length > 0) {
    noScore.forEach(p => {
      console.log(`  - ${p.name} (${p.id})`)
    })
  }

  // Check for invalid bifl_certification (if it's not an array or null)
  const invalidCert = products?.filter(p => {
    if (p.bifl_certification === null || p.bifl_certification === undefined) return false
    return !Array.isArray(p.bifl_certification)
  })
  console.log(`\nProducts with invalid bifl_certification: ${invalidCert?.length || 0}`)
  if (invalidCert && invalidCert.length > 0) {
    invalidCert.forEach(p => {
      console.log(`  - ${p.name} (${p.id}): ${JSON.stringify(p.bifl_certification)}`)
    })
  }
}

checkSlugIssues()
