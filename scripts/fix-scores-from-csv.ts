import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import { parse } from 'csv-parse/sync'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const productsWithIssues = [
  { id: '2f14be73-7e1f-4228-9266-9e77342d895e', name: 'Battle III Spinning Fishing Reel Size 5000' },
  { id: 'ee507b16-1056-4a4a-84cd-6fc3003fb5ee', name: 'Dog Toys' },
  { id: '900c52ae-eed7-4160-9a45-e8c774f350fe', name: 'Gas Camping Stove' },
  { id: '811618dc-5591-423a-b2a6-829cbe15ec17', name: 'Metro Travel Umbrella' },
  { id: 'a2fdba26-8c18-44ad-a2dd-2d2596bba563', name: 'Sandals' },
  { id: 'a2506a6b-564c-47fe-9cae-efa3984c4c11', name: 'Sleep Mask' },
  { id: '13d2bffb-508f-477c-b7ed-ae2a08f7596f', name: 'SM58 Pro XLR Dynamic Microphone' },
  { id: '7bd81825-a8a6-4097-b9d9-c8b531e4f8a2', name: 'Tempered Glass Chair Mat' },
  { id: 'be7c73ce-444c-467a-81a2-ff0188efb535', name: 'Unisex Outdoor UV Protection Sun Hat with Neck Flap Khaki' },
  { id: 'e9210d1f-4912-43e4-8afa-73f446a538dd', name: 'Work Briefcase' }
]

async function fixScoresFromCSV() {
  console.log('\n=== FIXING SCORES FROM CSV ===\n')

  // Read and parse CSV
  const csvPath = './BIFL Score Card - BIFL_Score_Card_ (9).csv'
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true
  })

  console.log(`Loaded ${records.length} rows from CSV\n`)

  for (const product of productsWithIssues) {
    console.log(`Processing: ${product.name}`)

    // Find matching row in CSV - try both exact match and partial match
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
      console.log(`  ⚠️  Product not found in CSV, trying to match by brand...`)
      // Get brand from database
      const { data: dbProduct } = await supabase
        .from('products')
        .select('name, brands(name)')
        .eq('id', product.id)
        .single()

      if (dbProduct && (dbProduct as any).brands?.name) {
        const brandName = (dbProduct as any).brands.name
        csvRow = records.find((row: any) =>
          row.product_name?.toLowerCase().includes(product.name.toLowerCase().split(' ').slice(-3).join(' ')) &&
          row.brand?.toLowerCase() === brandName.toLowerCase()
        )
      }
    }

    if (!csvRow) {
      console.log(`  ❌ Could not find product in CSV. Skipping.`)
      console.log('')
      continue
    }

    console.log(`  ✅ Found in CSV: ${csvRow.brand} - ${csvRow.product_name}`)

    const updates: any = {}

    // Extract scores from CSV
    if (csvRow.durability_score) {
      const score = parseFloat(csvRow.durability_score)
      if (!isNaN(score)) {
        updates.durability_score = score
        console.log(`  Setting durability_score to ${score}`)
      }
    }

    if (csvRow.repairability_score) {
      const score = parseFloat(csvRow.repairability_score)
      if (!isNaN(score)) {
        updates.repairability_score = score
        console.log(`  Setting repairability_score to ${score}`)
      }
    }

    if (csvRow.warranty_score) {
      const score = parseFloat(csvRow.warranty_score)
      if (!isNaN(score)) {
        updates.warranty_score = score
        console.log(`  Setting warranty_score to ${score}`)
      }
    }

    if (csvRow.sustainability_score) {
      const score = parseFloat(csvRow.sustainability_score)
      if (!isNaN(score)) {
        updates.sustainability_score = score
        console.log(`  Setting sustainability_score to ${score}`)
      }
    }

    if (csvRow.social_score) {
      const score = parseFloat(csvRow.social_score)
      if (!isNaN(score)) {
        updates.social_score = score
        console.log(`  Setting social_score to ${score}`)
      }
    }

    if (csvRow.bifl_total_score) {
      const score = parseFloat(csvRow.bifl_total_score)
      if (!isNaN(score)) {
        updates.bifl_total_score = score
        console.log(`  Setting bifl_total_score to ${score}`)
      }
    }

    if (Object.keys(updates).length === 0) {
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

fixScoresFromCSV()
