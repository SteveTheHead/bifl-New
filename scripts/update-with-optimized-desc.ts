import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import csv from 'csv-parser'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

interface CSVRow {
  product_name: string
  optimized_product_description: string
}

async function updateProductsWithOptimizedDesc() {
  const csvPath = '/Users/stephen/Downloads/BIFL Score Card - BIFL_Score_Card_ (9).csv'
  const updates: { name: string; description: string }[] = []

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row: CSVRow) => {
        if (row.product_name && row.optimized_product_description) {
          updates.push({
            name: row.product_name,
            description: row.optimized_product_description
          })
        }
      })
      .on('end', async () => {
        console.log(`Found ${updates.length} products with optimized descriptions`)

        // Update each product
        for (const update of updates) {
          try {
            const { error } = await supabase
              .from('products')
              .update({ optimized_product_description: update.description })
              .eq('name', update.name)

            if (error) {
              console.error(`Error updating ${update.name}:`, error)
            } else {
              console.log(`Updated: ${update.name}`)
            }
          } catch (error) {
            console.error(`Failed to update ${update.name}:`, error)
          }
        }

        resolve(updates)
      })
      .on('error', reject)
  })
}

updateProductsWithOptimizedDesc()
  .then(() => {
    console.log('Update completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Update failed:', error)
    process.exit(1)
  })