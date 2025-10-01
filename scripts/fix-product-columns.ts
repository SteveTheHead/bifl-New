import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as dotenv from 'dotenv'
import { parse } from 'csv-parse/sync'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

interface CSVRow {
  brand: string
  product_name: string
  'category TEXT': string
  amazon_category: string
  COE: string
  country_of_origin: string
  [key: string]: string
}

function parseCSV(filePath: string): CSVRow[] {
  const content = fs.readFileSync(filePath, 'utf-8')

  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    trim: true
  }) as CSVRow[]

  return records
}

function generateSlug(brand: string, productName: string): string {
  return `${brand}-${productName}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function getCategoryId(categoryPath: string): Promise<string | null> {
  if (!categoryPath) return null

  // Extract the last part of the category path as the main category
  const parts = categoryPath.split('>').map(p => p.trim())
  const categoryName = parts[parts.length - 1]

  const { data } = await supabase
    .from('categories')
    .select('id')
    .ilike('name', `%${categoryName}%`)
    .limit(1)

  return data && data.length > 0 ? data[0].id : null
}

async function fixProductColumns(csvPath: string) {
  console.log('Reading CSV file...\n')

  const rows = parseCSV(csvPath)
  console.log(`Found ${rows.length} products in CSV\n`)

  let updated = 0
  let notFound = 0
  let errors = 0

  for (const row of rows) {
    if (!row.product_name || !row.brand) {
      continue
    }

    const fullName = `${row.brand} ${row.product_name}`
    console.log(`Processing: ${fullName}`)

    // Find product by slug
    const slug = generateSlug(row.brand, row.product_name)
    const { data: existing } = await supabase
      .from('products')
      .select('id, country_of_origin, category_id')
      .eq('slug', slug)
      .limit(1)

    if (!existing || existing.length === 0) {
      console.log(`  ⚠️  Not found in database`)
      notFound++
      continue
    }

    const product = existing[0]
    const updates: any = {}

    // Fix country of origin - use COE column
    const correctCountry = row.COE || row.country_of_origin
    if (correctCountry && correctCountry !== product.country_of_origin) {
      updates.country_of_origin = correctCountry
      console.log(`  📍 Country: "${product.country_of_origin}" → "${correctCountry}"`)
    }

    // Fix category - use 'category TEXT' column
    const correctCategoryName = row['category TEXT'] || row.amazon_category
    if (correctCategoryName) {
      const correctCategoryId = await getCategoryId(correctCategoryName)
      if (correctCategoryId && correctCategoryId !== product.category_id) {
        updates.category_id = correctCategoryId
        console.log(`  📂 Category updated to: ${correctCategoryName}`)
      }
    }

    // Apply updates if any
    if (Object.keys(updates).length > 0) {
      const { error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', product.id)

      if (error) {
        console.log(`  ❌ Error: ${error.message}`)
        errors++
      } else {
        console.log(`  ✅ Updated`)
        updated++
      }
    } else {
      console.log(`  ✓ Already correct`)
    }

    console.log('')
  }

  console.log('\n=== Update Summary ===')
  console.log(`Total rows: ${rows.length}`)
  console.log(`Updated: ${updated}`)
  console.log(`Not found: ${notFound}`)
  console.log(`Errors: ${errors}`)
}

// Run the fix
const csvPath = '/Users/stephen/Documents/GitHub/bifl-New/BIFL Score Card - BIFL_Score_Card_ (9).csv'
fixProductColumns(csvPath).catch(console.error)
