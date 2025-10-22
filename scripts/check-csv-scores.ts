import * as fs from 'fs'
import { parse } from 'csv-parse/sync'

const productsToCheck = [
  'Dog Toys',
  'Sleep Mask',
  'Tempered Glass Chair Mat',
  'Work Briefcase'
]

async function checkCSVScores() {
  console.log('\n=== CHECKING CSV SCORES ===\n')

  // Read and parse CSV
  const csvPath = './BIFL Score Card - BIFL_Score_Card_ (9).csv'
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true
  })

  console.log(`Loaded ${records.length} rows from CSV\n`)

  for (const productName of productsToCheck) {
    console.log(`\n=== ${productName} ===`)

    // Find matching row in CSV
    const csvRow = records.find((row: any) =>
      row.product_name?.trim().toLowerCase() === productName.trim().toLowerCase()
    )

    if (!csvRow) {
      console.log('  ❌ Not found in CSV')
      continue
    }

    console.log(`  Brand: ${csvRow.brand}`)
    console.log(`  Product: ${csvRow.product_name}`)
    console.log(`  Status: ${csvRow.Status}`)
    console.log(`  Stage: ${csvRow.stage}`)
    console.log('\n  Scores:')
    console.log(`    durability_score: ${csvRow.durability_score || 'MISSING'}`)
    console.log(`    repairability_score: ${csvRow.repairability_score || 'MISSING'}`)
    console.log(`    warranty_score: ${csvRow.warranty_score || 'MISSING'}`)
    console.log(`    sustainability_score: ${csvRow.sustainability_score || 'MISSING'}`)
    console.log(`    social_score: ${csvRow.social_score || 'MISSING'}`)
    console.log(`    bifl_total_score: ${csvRow.bifl_total_score || 'MISSING'}`)
  }
}

checkCSVScores()
