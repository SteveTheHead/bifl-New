import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import { parse } from 'csv-parse/sync'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const unpublishedProducts = [
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

async function importAndRepublish() {
  console.log('\n=== IMPORTING CLEAN DATA AND REPUBLISHING ===\n')

  // Load CSV
  const csvPath = '/Users/stephen/Downloads/BIFL Score Card - For Import (4).csv'
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true
  })

  console.log(`Loaded ${records.length} rows from CSV\n`)

  // Get all draft products
  const { data: draftProducts } = await supabase
    .from('products')
    .select('id, name')
    .eq('status', 'draft')

  let imported = 0
  let skipped = 0

  for (const productName of unpublishedProducts) {
    console.log(`\nProcessing: ${productName}`)

    // Find in database
    const dbProduct = draftProducts?.find((p: any) =>
      p.name.toLowerCase().trim() === productName.toLowerCase().trim()
    )

    if (!dbProduct) {
      console.log(`  ⚠️  Not found in database as draft - may already be published`)
      skipped++
      continue
    }

    // Find in CSV
    const csvRow = records.find((row: any) =>
      row.product_name?.trim().toLowerCase() === productName.trim().toLowerCase()
    )

    if (!csvRow) {
      console.log(`  ❌ Not found in CSV`)
      skipped++
      continue
    }

    console.log(`  ✅ Found: ${csvRow.brand} - ${csvRow.product_name}`)

    // Prepare updates with all scores and notes
    const updates: any = {
      status: 'published' // Republish it
    }

    // Import all scores
    if (csvRow.durability_score) {
      updates.durability_score = parseFloat(csvRow.durability_score)
    }
    if (csvRow.repairability_score) {
      updates.repairability_score = parseFloat(csvRow.repairability_score)
    }
    if (csvRow.warranty_score) {
      updates.warranty_score = parseFloat(csvRow.warranty_score)
    }
    if (csvRow.social_score) {
      updates.social_score = parseFloat(csvRow.social_score)
    }
    if (csvRow.sustainability_score) {
      updates.sustainability_score = parseFloat(csvRow.sustainability_score)
    }
    if (csvRow.bifl_total_score) {
      updates.bifl_total_score = parseFloat(csvRow.bifl_total_score)
    }

    // Import all notes
    if (csvRow.durability_notes && !csvRow.durability_notes.includes('Error parsing')) {
      updates.durability_notes = csvRow.durability_notes
    }
    if (csvRow.repairability_notes && !csvRow.repairability_notes.includes('Error parsing')) {
      updates.repairability_notes = csvRow.repairability_notes
    }
    if (csvRow.warranty_notes && !csvRow.warranty_notes.includes('Error parsing')) {
      updates.warranty_notes = csvRow.warranty_notes
    }
    if (csvRow.social_notes && !csvRow.social_notes.includes('Error parsing')) {
      updates.social_notes = csvRow.social_notes
    }
    if (csvRow.sustainability_notes && !csvRow.sustainability_notes.includes('Error parsing')) {
      updates.sustainability_notes = csvRow.sustainability_notes
    }

    // Update product
    const { error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', dbProduct.id)

    if (error) {
      console.error(`  ❌ Error: ${error.message}`)
      skipped++
    } else {
      console.log(`  ✅ Imported clean data and REPUBLISHED!`)
      imported++
    }
  }

  console.log('\n=== SUMMARY ===')
  console.log(`✅ Successfully imported and republished: ${imported}`)
  console.log(`⚠️  Skipped: ${skipped}`)

  // Final count
  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')

  console.log(`\n📊 Total published products: ${count}`)
}

importAndRepublish()
