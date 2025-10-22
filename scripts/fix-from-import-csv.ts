import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import { parse } from 'csv-parse/sync'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const productsToFix = [
  { id: 'ee507b16-1056-4a4a-84cd-6fc3003fb5ee', name: 'Dog Toys' },
  { id: 'a2506a6b-564c-47fe-9cae-efa3984c4c11', name: 'Sleep Mask' },
  { id: '7bd81825-a8a6-4097-b9d9-c8b531e4f8a2', name: 'Tempered Glass Chair Mat' },
  { id: 'e9210d1f-4912-43e4-8afa-73f446a538dd', name: 'Work Briefcase' }
]

async function fixFromImportCSV() {
  console.log('\n=== FIXING SCORES FROM IMPORT CSV ===\n')

  // Read and parse CSV
  const csvPath = '/Users/stephen/Downloads/BIFL Score Card - For Import (1).csv'
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true
  })

  console.log(`Loaded ${records.length} rows from import CSV\n`)

  for (const product of productsToFix) {
    console.log(`Processing: ${product.name}`)

    // Find matching row in CSV - try exact match first
    let csvRow = records.find((row: any) =>
      row.product_name?.trim().toLowerCase() === product.name.trim().toLowerCase()
    )

    if (!csvRow) {
      // Try partial match
      csvRow = records.find((row: any) => {
        const csvName = row.product_name?.trim().toLowerCase() || ''
        const productName = product.name.trim().toLowerCase()
        return csvName.includes(productName) || productName.includes(csvName)
      })
    }

    if (!csvRow) {
      console.log(`  ❌ Product not found in import CSV. Skipping.`)
      console.log('')
      continue
    }

    console.log(`  ✅ Found in CSV: ${csvRow.brand} - ${csvRow.product_name}`)

    const updates: any = {}
    let hasValidScores = false

    // Extract scores from CSV
    if (csvRow.durability_score) {
      const score = parseFloat(csvRow.durability_score)
      if (!isNaN(score) && score > 0) {
        updates.durability_score = score
        hasValidScores = true
        console.log(`  Setting durability_score to ${score}`)
      }
    }

    if (csvRow.repairability_score) {
      const score = parseFloat(csvRow.repairability_score)
      if (!isNaN(score) && score > 0) {
        updates.repairability_score = score
        hasValidScores = true
        console.log(`  Setting repairability_score to ${score}`)
      }
    }

    if (csvRow.warranty_score) {
      const score = parseFloat(csvRow.warranty_score)
      if (!isNaN(score) && score > 0) {
        updates.warranty_score = score
        hasValidScores = true
        console.log(`  Setting warranty_score to ${score}`)
      }
    }

    if (csvRow.sustainability_score) {
      const score = parseFloat(csvRow.sustainability_score)
      if (!isNaN(score) && score > 0) {
        updates.sustainability_score = score
        hasValidScores = true
        console.log(`  Setting sustainability_score to ${score}`)
      }
    }

    if (csvRow.social_score) {
      const score = parseFloat(csvRow.social_score)
      if (!isNaN(score) && score > 0) {
        updates.social_score = score
        hasValidScores = true
        console.log(`  Setting social_score to ${score}`)
      }
    }

    if (csvRow.bifl_total_score) {
      const score = parseFloat(csvRow.bifl_total_score)
      if (!isNaN(score) && score > 0) {
        updates.bifl_total_score = score
        hasValidScores = true
        console.log(`  Setting bifl_total_score to ${score}`)
      }
    }

    if (!hasValidScores) {
      console.log(`  ⚠️  No valid scores found in CSV for this product`)
      console.log('')
      continue
    }

    // Update the product
    const { error: updateError } = await supabase
      .from('products')
      .update(updates)
      .eq('id', product.id)

    if (updateError) {
      console.error(`  ❌ Error updating product: ${updateError.message}`)
    } else {
      console.log(`  ✅ Successfully updated!`)
    }
    console.log('')
  }

  console.log('\n=== DONE ===\n')
  console.log('Run audit script to verify all scores are complete.')
}

fixFromImportCSV()
