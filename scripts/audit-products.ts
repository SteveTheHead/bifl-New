import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function auditProducts() {
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, bifl_total_score, durability_score, repairability_score, warranty_score, social_score, sustainability_score, durability_notes, repairability_notes, warranty_notes, social_notes')
    .eq('status', 'published')
    .order('name')

  if (error) {
    console.error('Error fetching products:', error)
    return
  }

  console.log('\n=== PRODUCT AUDIT REPORT ===\n')
  console.log(`Total published products: ${products.length}\n`)

  const issues: any[] = []

  products.forEach((product: any) => {
    const productIssues: string[] = []

    // Check scores
    if (product.bifl_total_score === null) productIssues.push('Missing BIFL Total Score')
    if (product.durability_score === null) productIssues.push('Missing Durability Score')
    if (product.repairability_score === null) productIssues.push('Missing Repairability Score')
    if (product.warranty_score === null) productIssues.push('Missing Warranty Score')
    if (product.social_score === null) productIssues.push('Missing Social Score')
    if (product.sustainability_score === null) productIssues.push('Missing Sustainability Score')

    // Check notes
    if (!product.durability_notes || product.durability_notes.trim() === '') {
      productIssues.push('Missing Durability Notes')
    }
    if (!product.repairability_notes || product.repairability_notes.trim() === '') {
      productIssues.push('Missing Repairability Notes')
    }
    if (!product.warranty_notes || product.warranty_notes.trim() === '') {
      productIssues.push('Missing Warranty Notes')
    }
    if (!product.social_notes || product.social_notes.trim() === '') {
      productIssues.push('Missing Social Notes')
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
    console.log('✅ All products have complete scores and notes!')
  } else {
    console.log(`⚠️  Found ${issues.length} products with missing data:\n`)
    issues.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name} (ID: ${item.id})`)
      item.issues.forEach((issue: string) => {
        console.log(`   - ${issue}`)
      })
      console.log('')
    })
  }

  // Summary statistics
  const missingScores = {
    bifl_total: products.filter((p: any) => p.bifl_total_score === null).length,
    durability: products.filter((p: any) => p.durability_score === null).length,
    repairability: products.filter((p: any) => p.repairability_score === null).length,
    warranty: products.filter((p: any) => p.warranty_score === null).length,
    social: products.filter((p: any) => p.social_score === null).length,
    sustainability: products.filter((p: any) => p.sustainability_score === null).length,
  }

  const missingNotes = {
    durability: products.filter((p: any) => !p.durability_notes || p.durability_notes.trim() === '').length,
    repairability: products.filter((p: any) => !p.repairability_notes || p.repairability_notes.trim() === '').length,
    warranty: products.filter((p: any) => !p.warranty_notes || p.warranty_notes.trim() === '').length,
    social: products.filter((p: any) => !p.social_notes || p.social_notes.trim() === '').length,
  }

  console.log('\n=== SUMMARY STATISTICS ===\n')
  console.log('Missing Scores:')
  console.log(`  - BIFL Total Score: ${missingScores.bifl_total}`)
  console.log(`  - Durability Score: ${missingScores.durability}`)
  console.log(`  - Repairability Score: ${missingScores.repairability}`)
  console.log(`  - Warranty Score: ${missingScores.warranty}`)
  console.log(`  - Social Score: ${missingScores.social}`)
  console.log(`  - Sustainability Score: ${missingScores.sustainability}`)
  console.log('\nMissing Notes:')
  console.log(`  - Durability Notes: ${missingNotes.durability}`)
  console.log(`  - Repairability Notes: ${missingNotes.repairability}`)
  console.log(`  - Warranty Notes: ${missingNotes.warranty}`)
  console.log(`  - Social Notes: ${missingNotes.social}`)
  console.log('')
}

auditProducts()
