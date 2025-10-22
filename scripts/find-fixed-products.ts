import * as fs from 'fs'
import { parse } from 'csv-parse/sync'

// The 20 products we unpublished
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

async function findFixedProducts() {
  console.log('\n=== CHECKING WHICH UNPUBLISHED PRODUCTS ARE NOW COMPLETE ===\n')

  const csvPath = '/Users/stephen/Downloads/BIFL Score Card - For Import (2).csv'
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true
  })

  const nowComplete: string[] = []
  const stillIncomplete: string[] = []

  for (const productName of unpublishedProducts) {
    // Find in CSV
    const csvRow = records.find((row: any) =>
      row.product_name?.trim().toLowerCase() === productName.trim().toLowerCase()
    )

    if (!csvRow) {
      console.log(`⚠️  ${productName} - NOT FOUND IN CSV`)
      stillIncomplete.push(productName)
      continue
    }

    // Check if complete
    const hasAllScores =
      csvRow.durability_score && parseFloat(csvRow.durability_score) > 0 &&
      csvRow.repairability_score && parseFloat(csvRow.repairability_score) > 0 &&
      csvRow.warranty_score && parseFloat(csvRow.warranty_score) > 0 &&
      csvRow.social_score && parseFloat(csvRow.social_score) > 0 &&
      csvRow.sustainability_score && parseFloat(csvRow.sustainability_score) > 0 &&
      csvRow.bifl_total_score && parseFloat(csvRow.bifl_total_score) > 0

    const hasAllNotes =
      csvRow.durability_notes && csvRow.durability_notes.trim() !== '' && !csvRow.durability_notes.includes('Error parsing') &&
      csvRow.repairability_notes && csvRow.repairability_notes.trim() !== '' && !csvRow.repairability_notes.includes('Error parsing') &&
      csvRow.warranty_notes && csvRow.warranty_notes.trim() !== '' && !csvRow.warranty_notes.includes('Error parsing') &&
      csvRow.social_notes && csvRow.social_notes.trim() !== '' && !csvRow.social_notes.includes('Error parsing')

    if (hasAllScores && hasAllNotes) {
      console.log(`✅ ${csvRow.brand} - ${productName} - COMPLETE`)
      nowComplete.push(productName)
    } else {
      console.log(`❌ ${csvRow.brand} - ${productName} - STILL INCOMPLETE`)
      stillIncomplete.push(productName)
    }
  }

  console.log('\n=== SUMMARY ===\n')
  console.log(`✅ ${nowComplete.length} products NOW COMPLETE (can be republished):`)
  nowComplete.forEach(name => console.log(`   - ${name}`))

  console.log(`\n❌ ${stillIncomplete.length} products STILL INCOMPLETE (keep unpublished):`)
  stillIncomplete.forEach(name => console.log(`   - ${name}`))
}

findFixedProducts()
