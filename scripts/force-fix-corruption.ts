import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import { parse } from 'csv-parse/sync'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const corruptedProductIds = [
  'ea8fae7d-0423-4747-8c62-ad8e24dedf91', // 289 Multimeter
  '64d11973-0429-4ef8-b85d-8a855c3799d0', // Espresso Machine
  'd5b5c256-80bc-4bda-a3d3-527a10b905f4', // ET-ZLC30 Toaster Oven
  '0050842d-cdca-43e6-94f2-42b17011db41', // F300 Sewing Machine
  'a9ba668b-43f0-4bcf-8d47-6cb5d0a61474', // Fuzzy Rice Cooker
  'fa4443a7-071e-42da-9e54-1f864560597c', // MC-2 Compass
  '82afeea7-32b1-4d10-ae08-016889486ae2', // Nest Hammocks
  'bfa7ac45-bf37-491b-9063-f52e5d23ecf3', // Platinum BP5450
  '7de25845-78fa-4b0c-9c37-a85489d7b33f', // Racing Tire Pressure Gauge
  '81a3e40f-01e6-4e91-acdc-ddad4c042678', // Travel Gear
  '40d6e058-d004-45a4-9a89-b6b8019a71e4', // Vinum Cabernet/Merlot Wine Glasses Set of 2
]

async function forceFixCorruption() {
  console.log('\n=== FORCE FIXING CORRUPTED NOTES ===\n')

  // Load CSV
  const csvPath = '/Users/stephen/Downloads/BIFL Score Card - For Import (4).csv'
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true
  })

  // Get products
  const { data: products } = await supabase
    .from('products')
    .select('id, name')
    .in('id', corruptedProductIds)

  if (!products) {
    console.log('No products found')
    return
  }

  for (const product of products) {
    console.log(`\nProcessing: ${product.name}`)

    // Find in CSV
    const csvRow = records.find((row: any) =>
      row.product_name?.trim().toLowerCase() === product.name.trim().toLowerCase()
    )

    if (!csvRow) {
      console.log(`  ❌ Not found in CSV`)
      continue
    }

    const updates: any = {}

    // FORCE update all notes from CSV
    if (csvRow.durability_notes) {
      updates.durability_notes = csvRow.durability_notes
      console.log(`  ✓ Updating durability_notes`)
    }
    if (csvRow.repairability_notes) {
      updates.repairability_notes = csvRow.repairability_notes
      console.log(`  ✓ Updating repairability_notes`)
    }
    if (csvRow.warranty_notes) {
      updates.warranty_notes = csvRow.warranty_notes
      console.log(`  ✓ Updating warranty_notes`)
    }
    if (csvRow.social_notes) {
      updates.social_notes = csvRow.social_notes
      console.log(`  ✓ Updating social_notes`)
    }
    if (csvRow.sustainability_notes) {
      updates.sustainability_notes = csvRow.sustainability_notes
      console.log(`  ✓ Updating sustainability_notes`)
    }

    if (Object.keys(updates).length === 0) {
      console.log(`  ⚠️  No notes found in CSV`)
      continue
    }

    const { error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', product.id)

    if (error) {
      console.error(`  ❌ Error: ${error.message}`)
    } else {
      console.log(`  ✅ Fixed!`)
    }
  }

  console.log('\n=== DONE ===\n')
}

forceFixCorruption()
