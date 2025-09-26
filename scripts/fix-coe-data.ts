import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import Papa from 'papaparse'
import fs from 'fs'

// Load environment variables
dotenv.config({ path: '.env.local' })

interface CSVRow {
  product_name: string
  COE: string
  bifl_certification: string
  [key: string]: string
}

function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function fixCOEData() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  console.log('🌍 Fixing COE and BIFL certification data...')

  // Read the CSV file
  const csvFilePath = '/Users/stephen/Downloads/BIFL Score Card - BIFL_Score_Card_ (9).csv'
  const csvContent = fs.readFileSync(csvFilePath, 'utf-8')

  const { data: records } = Papa.parse<CSVRow>(csvContent, {
    header: true,
    skipEmptyLines: true
  })

  console.log(`📊 Found ${records.length} records in CSV`)

  let updatedCount = 0
  let errorCount = 0

  for (const row of records.slice(0, 100)) {
    if (!row.product_name) {
      console.log(`⏭️ Skipping - missing product name`)
      continue
    }

    try {
      // Find the product by name
      let product: any = null

      const nameResult = await supabase
        .from('products')
        .select('id, name, slug')
        .ilike('name', `%${row.product_name}%`)
        .limit(1)

      if (nameResult.data && nameResult.data.length > 0) {
        product = nameResult.data[0]
      } else {
        // Fallback: try slug matching
        const productSlug = createSlug(row.product_name)
        const slugResult = await supabase
          .from('products')
          .select('id, name, slug')
          .ilike('slug', `%${productSlug}%`)
          .limit(1)

        if (slugResult.data && slugResult.data.length > 0) {
          product = slugResult.data[0]
        }
      }

      if (!product) {
        console.log(`❌ Product not found: ${row.product_name}`)
        errorCount++
        continue
      }

      // Prepare update data (only COE for now)
      const updateData: any = {}

      if (row.COE && row.COE.trim() !== '') {
        updateData.country_of_origin = row.COE.trim()
      }

      if (Object.keys(updateData).length === 0) {
        console.log(`⏭️ No COE data for ${product.name}`)
        continue
      }

      // Update the product
      const { error: updateError } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', product.id)

      if (updateError) {
        console.log(`❌ Failed to update ${product.name}:`, updateError.message)
        errorCount++
      } else {
        console.log(`✅ Updated ${product.name} → COE: ${updateData.country_of_origin}`)
        updatedCount++
      }

    } catch (error) {
      console.log(`❌ Error processing ${row.product_name}:`, error)
      errorCount++
    }
  }

  console.log(`🎉 Updated ${updatedCount} products with COE data`)
  console.log(`❌ ${errorCount} errors`)
}

fixCOEData().catch(console.error)