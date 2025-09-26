import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import Papa from 'papaparse'
import fs from 'fs'

// Load environment variables
dotenv.config({ path: '.env.local' })

interface CSVRow {
  product_name: string
  'category TEXT': string
  'sub_category TEXT': string
  [key: string]: string
}

function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function fixProductCategories() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  console.log('🔧 Fixing product category relationships...')

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

  for (const row of records.slice(0, 100)) { // Process first 100 like the import script
    if (!row.product_name || !row['category TEXT']) {
      console.log(`⏭️ Skipping ${row.product_name} - missing data`)
      continue
    }

    try {
      // Find the product by name (try exact name match first, then partial match)
      let product: any = null
      let productError: any = null

      // Try to find by name directly
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
        } else {
          productError = { message: 'Product not found' }
        }
      }

      if (productError || !product) {
        console.log(`❌ Product not found: ${row.product_name}`)
        errorCount++
        continue
      }

      // Find the category by name
      const categorySlug = createSlug(row['category TEXT'])
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .select('id, name')
        .eq('slug', categorySlug)
        .single()

      if (categoryError || !category) {
        console.log(`❌ Category not found: ${row['category TEXT']}`)
        errorCount++
        continue
      }

      // Update the product with the correct category_id
      const { error: updateError } = await supabase
        .from('products')
        .update({ category_id: category.id })
        .eq('id', product.id)

      if (updateError) {
        console.log(`❌ Failed to update ${product.name}:`, updateError.message)
        errorCount++
      } else {
        console.log(`✅ Updated ${product.name} → ${category.name}`)
        updatedCount++
      }

    } catch (error) {
      console.log(`❌ Error processing ${row.product_name}:`, error)
      errorCount++
    }
  }

  console.log(`🎉 Fixed ${updatedCount} product categories`)
  console.log(`❌ ${errorCount} errors`)
}

fixProductCategories().catch(console.error)