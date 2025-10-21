import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function validateProducts() {
  console.log('Validating product data...\n')

  const { data: products } = await supabase
    .from('products')
    .select('id, name, price, brand_id, category_id, slug, status')
    .eq('status', 'published')

  if (!products || products.length === 0) {
    console.error('❌ No published products found')
    process.exit(1)
  }

  console.log(`Total published products: ${products.length}`)

  const issues: string[] = []

  products.forEach(p => {
    if (!p.name) {
      issues.push(`❌ Product ${p.id}: Missing name`)
    }
    if (!p.slug) {
      issues.push(`❌ Product ${p.id} (${p.name || 'NO NAME'}): Missing slug`)
    }
    if (!p.price && p.price !== 0) {
      issues.push(`⚠️  Product ${p.id} (${p.name}): Missing price`)
    }
    if (!p.brand_id) {
      issues.push(`❌ Product ${p.id} (${p.name}): Missing brand_id`)
    }
    if (!p.category_id) {
      issues.push(`❌ Product ${p.id} (${p.name}): Missing category_id`)
    }
  })

  // Count warnings vs errors
  const errors = issues.filter(i => i.startsWith('❌'))
  const warnings = issues.filter(i => i.startsWith('⚠️'))

  if (issues.length > 0) {
    console.log('\nData validation issues found:\n')
    issues.forEach(i => console.log(i))

    console.log(`\nSummary:`)
    console.log(`  Errors: ${errors.length}`)
    console.log(`  Warnings: ${warnings.length}`)

    // Only fail on errors, not warnings (missing prices are OK)
    if (errors.length > 0) {
      console.error('\n❌ Validation failed - critical errors found')
      process.exit(1)
    } else {
      console.log('\n⚠️  Validation passed with warnings')
      process.exit(0)
    }
  }

  console.log('\n✅ All products validated successfully')
}

validateProducts()
