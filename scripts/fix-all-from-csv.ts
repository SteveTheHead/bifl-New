import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import { parse } from 'csv-parse/sync'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// List of products with corruption
const corruptedProducts = [
  '289 Multimeter',
  'Battle III Spinning Fishing Reel Size 5000',
  'Dog Toys',
  'Espresso Machine',
  'ET-ZLC30 Toaster Oven',
  'F300 Sewing Machine',
  'Fuzzy Rice Cooker',
  'Gas Camping Stove',
  'MC-2 Compass',
  'Metro Travel Umbrella',
  'Nest Hammocks',
  'Platinum BP5450',
  'Racing Tire Pressure Gauge',
  'Sandals',
  'Sleep Mask',
  'Tempered Glass Chair Mat',
  'Travel Gear',
  'Unisex Outdoor UV Protection Sun Hat with Neck Flap Khaki',
  'Vinum Cabernet/Merlot Wine Glasses Set of 2',
  'Work Briefcase'
]

async function fixAllFromCSV() {
  console.log('\n=== FIXING ALL CORRUPTED DATA FROM CSV ===\n')

  // Read and parse CSV
  const csvPath = '/Users/stephen/Downloads/BIFL Score Card - For Import (1).csv'
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true
  })

  console.log(`Loaded ${records.length} rows from CSV\n`)

  // Get all published products from database
  const { data: dbProducts } = await supabase
    .from('products')
    .select('id, name')
    .eq('status', 'published')

  for (const productName of corruptedProducts) {
    console.log(`\nProcessing: ${productName}`)

    // Find product in database
    const dbProduct = dbProducts?.find((p: any) =>
      p.name.toLowerCase().trim() === productName.toLowerCase().trim()
    )

    if (!dbProduct) {
      console.log(`  ❌ Product not found in database`)
      continue
    }

    // Find in CSV
    let csvRow = records.find((row: any) =>
      row.product_name?.trim().toLowerCase() === productName.trim().toLowerCase()
    )

    if (!csvRow) {
      // Try partial match
      csvRow = records.find((row: any) => {
        const csvName = row.product_name?.trim().toLowerCase() || ''
        const searchName = productName.trim().toLowerCase()
        return csvName.includes(searchName) || searchName.includes(csvName)
      })
    }

    if (!csvRow) {
      console.log(`  ❌ Product not found in CSV`)
      continue
    }

    console.log(`  ✅ Found in CSV: ${csvRow.brand} - ${csvRow.product_name}`)

    const updates: any = {}

    // Import scores (only if valid and > 0)
    if (csvRow.durability_score) {
      const score = parseFloat(csvRow.durability_score)
      if (!isNaN(score) && score > 0) {
        updates.durability_score = score
        console.log(`  ✓ durability_score: ${score}`)
      }
    }

    if (csvRow.repairability_score) {
      const score = parseFloat(csvRow.repairability_score)
      if (!isNaN(score) && score > 0) {
        updates.repairability_score = score
      }
    }

    if (csvRow.warranty_score) {
      const score = parseFloat(csvRow.warranty_score)
      if (!isNaN(score) && score > 0) {
        updates.warranty_score = score
      }
    }

    if (csvRow.social_score) {
      const score = parseFloat(csvRow.social_score)
      if (!isNaN(score) && score > 0) {
        updates.social_score = score
      }
    }

    if (csvRow.sustainability_score) {
      const score = parseFloat(csvRow.sustainability_score)
      if (!isNaN(score) && score > 0) {
        updates.sustainability_score = score
      }
    }

    if (csvRow.bifl_total_score) {
      const score = parseFloat(csvRow.bifl_total_score)
      if (!isNaN(score) && score > 0) {
        updates.bifl_total_score = score
      }
    }

    // Import notes (only if they don't contain errors)
    if (csvRow.durability_notes && !csvRow.durability_notes.includes('Error parsing')) {
      updates.durability_notes = csvRow.durability_notes
      console.log(`  ✓ durability_notes: ${csvRow.durability_notes.substring(0, 50)}...`)
    } else if (csvRow.durability_notes) {
      console.log(`  ⚠️  Skipping corrupted durability_notes`)
    }

    if (csvRow.repairability_notes && !csvRow.repairability_notes.includes('Error parsing')) {
      updates.repairability_notes = csvRow.repairability_notes
    } else if (csvRow.repairability_notes) {
      console.log(`  ⚠️  Skipping corrupted repairability_notes`)
    }

    if (csvRow.warranty_notes && !csvRow.warranty_notes.includes('Error parsing')) {
      updates.warranty_notes = csvRow.warranty_notes
    } else if (csvRow.warranty_notes) {
      console.log(`  ⚠️  Skipping corrupted warranty_notes`)
    }

    if (csvRow.social_notes && !csvRow.social_notes.includes('Error parsing')) {
      updates.social_notes = csvRow.social_notes
    } else if (csvRow.social_notes) {
      console.log(`  ⚠️  Skipping corrupted social_notes`)
    }

    if (csvRow.sustainability_notes && !csvRow.sustainability_notes.includes('Error parsing')) {
      updates.sustainability_notes = csvRow.sustainability_notes
    } else if (csvRow.sustainability_notes) {
      console.log(`  ⚠️  Skipping corrupted sustainability_notes`)
    }

    if (Object.keys(updates).length === 0) {
      console.log(`  ⚠️  No valid data to update`)
      continue
    }

    // Update product
    const { error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', dbProduct.id)

    if (error) {
      console.error(`  ❌ Error updating: ${error.message}`)
    } else {
      console.log(`  ✅ Successfully updated with ${Object.keys(updates).length} fields`)
    }
  }

  console.log('\n=== DONE ===\n')
}

fixAllFromCSV()
