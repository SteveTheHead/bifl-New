import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function findCorruptedData() {
  console.log('\n=== FINDING CORRUPTED/INVALID DATA ===\n')

  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, durability_score, durability_notes, repairability_score, repairability_notes, warranty_score, warranty_notes, social_score, social_notes, sustainability_notes')
    .eq('status', 'published')
    .order('name')

  if (error) {
    console.error('Error:', error)
    return
  }

  const issues: any[] = []

  products.forEach((product: any) => {
    const productIssues: string[] = []

    // Check for error messages in notes (only check for actual error messages, not the word "error" in content)
    if (product.durability_notes?.includes('Error parsing')) {
      productIssues.push('Corrupted durability_notes (contains error message)')
    }
    if (product.repairability_notes?.includes('Error parsing')) {
      productIssues.push('Corrupted repairability_notes (contains error message)')
    }
    if (product.warranty_notes?.includes('Error parsing')) {
      productIssues.push('Corrupted warranty_notes (contains error message)')
    }
    if (product.social_notes?.includes('Error parsing')) {
      productIssues.push('Corrupted social_notes (contains error message)')
    }
    if (product.sustainability_notes?.includes('Error parsing')) {
      productIssues.push('Corrupted sustainability_notes (contains error message)')
    }

    // Check for null scores that should exist
    if (product.durability_score === null) {
      productIssues.push('Missing durability_score')
    }

    if (productIssues.length > 0) {
      issues.push({
        id: product.id,
        name: product.name,
        issues: productIssues
      })
    }
  })

  if (issues.length === 0) {
    console.log('✅ No data corruption found!')
  } else {
    console.log(`⚠️  Found ${issues.length} products with data issues:\n`)
    issues.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name} (ID: ${item.id})`)
      item.issues.forEach((issue: string) => {
        console.log(`   - ${issue}`)
      })
      console.log('')
    })
  }
}

findCorruptedData()
