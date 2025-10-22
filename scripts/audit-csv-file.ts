import * as fs from 'fs'
import { parse } from 'csv-parse/sync'

async function auditCSV() {
  console.log('\n=== AUDITING CSV FILE ===\n')

  const csvPath = '/Users/stephen/Downloads/BIFL Score Card - For Import (4).csv'
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true
  })

  console.log(`Total products in CSV: ${records.length}\n`)

  const issues: any[] = []

  records.forEach((row: any, index: number) => {
    const productIssues: string[] = []
    const productName = row.product_name || `Row ${index + 2}`

    // Check for missing scores
    if (!row.durability_score || parseFloat(row.durability_score) === 0 || isNaN(parseFloat(row.durability_score))) {
      productIssues.push('Missing durability_score')
    }
    if (!row.repairability_score || parseFloat(row.repairability_score) === 0 || isNaN(parseFloat(row.repairability_score))) {
      productIssues.push('Missing repairability_score')
    }
    if (!row.warranty_score || parseFloat(row.warranty_score) === 0 || isNaN(parseFloat(row.warranty_score))) {
      productIssues.push('Missing warranty_score')
    }
    if (!row.social_score || parseFloat(row.social_score) === 0 || isNaN(parseFloat(row.social_score))) {
      productIssues.push('Missing social_score')
    }
    if (!row.sustainability_score || parseFloat(row.sustainability_score) === 0 || isNaN(parseFloat(row.sustainability_score))) {
      productIssues.push('Missing sustainability_score')
    }
    if (!row.bifl_total_score || parseFloat(row.bifl_total_score) === 0 || isNaN(parseFloat(row.bifl_total_score))) {
      productIssues.push('Missing bifl_total_score')
    }

    // Check for missing or corrupted notes
    if (!row.durability_notes || row.durability_notes.trim() === '' || row.durability_notes.includes('Error parsing')) {
      productIssues.push('Missing/corrupted durability_notes')
    }
    if (!row.repairability_notes || row.repairability_notes.trim() === '' || row.repairability_notes.includes('Error parsing')) {
      productIssues.push('Missing/corrupted repairability_notes')
    }
    if (!row.warranty_notes || row.warranty_notes.trim() === '' || row.warranty_notes.includes('Error parsing')) {
      productIssues.push('Missing/corrupted warranty_notes')
    }
    if (!row.social_notes || row.social_notes.trim() === '' || row.social_notes.includes('Error parsing')) {
      productIssues.push('Missing/corrupted social_notes')
    }

    if (productIssues.length > 0) {
      issues.push({
        brand: row.brand || 'Unknown',
        name: productName,
        issues: productIssues
      })
    }
  })

  if (issues.length === 0) {
    console.log('✅ All products in CSV have complete scores and notes!')
  } else {
    console.log(`⚠️  Found ${issues.length} products with missing data:\n`)
    issues.forEach((item, index) => {
      console.log(`${index + 1}. ${item.brand} - ${item.name}`)
      item.issues.forEach((issue: string) => {
        console.log(`   - ${issue}`)
      })
      console.log('')
    })
  }

  // Summary
  console.log('\n=== SUMMARY ===')
  console.log(`Total products: ${records.length}`)
  console.log(`Products with issues: ${issues.length}`)
  console.log(`Complete products: ${records.length - issues.length}`)
}

auditCSV()
