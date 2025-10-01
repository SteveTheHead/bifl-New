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
  affiliate_link: string
  cover_image_url: string
  gallery_image_urls: string
  price_amazon: string
  star_rating: string
  review_count: string
  amazon_category: string
  'category TEXT': string
  amazon_description_full: string
  material: string
  dimensions: string
  durability_score: string
  durability_notes: string
  repairability_score: string
  repairability_notes: string
  warranty_score: string
  warranty_notes: string
  sustainability_score: string
  sustainability_notes: string
  social_score: string
  social_notes: string
  bifl_total_score: string
  verdict_summary: string
  verdict_bullet_1: string
  verdict_bullet_2: string
  verdict_bullet_3: string
  verdict_bullet_4: string
  verdict_bullet_5: string
  optimized_product_description: string
  lifespan_expectation: string
  COE: string
  country_of_origin: string
  use_case: string
}

function parseCSV(filePath: string, startRow: number = 1, endRow: number = 152): CSVRow[] {
  const content = fs.readFileSync(filePath, 'utf-8')

  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    trim: true
  }) as CSVRow[]

  // Return only rows startRow-1 to endRow-1 (0-indexed)
  return records.slice(startRow - 1, endRow)
}

function generateSlug(brand: string, productName: string): string {
  return `${brand}-${productName}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function parsePrice(priceStr: string): number | null {
  if (!priceStr) return null
  const cleaned = priceStr.replace(/[$,]/g, '')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? null : parsed
}

function parseFloatSafe(str: string): number | null {
  if (!str) return null
  const parsed = parseFloat(str)
  return isNaN(parsed) ? null : parsed
}

function parseGalleryImages(imageStr: string): string[] | null {
  if (!imageStr) return null
  return imageStr.split(',').map(url => url.trim()).filter(url => url.length > 0)
}

async function getBrandId(brandName: string): Promise<string | null> {
  if (!brandName) return null

  const { data } = await supabase
    .from('brands')
    .select('id')
    .ilike('name', brandName)
    .limit(1)

  if (data && data.length > 0) {
    return data[0].id
  }

  // Brand doesn't exist - create it
  const { data: newBrand, error } = await supabase
    .from('brands')
    .insert({ name: brandName, slug: generateSlug('', brandName) })
    .select('id')
    .single()

  if (error) {
    console.log(`  ⚠️  Could not create brand: ${brandName}`)
    return null
  }

  return newBrand.id
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

async function importProducts(csvPath: string) {
  console.log('Reading CSV file...\n')

  const rows = parseCSV(csvPath, 1, 152)
  console.log(`Found ${rows.length} products to import\n`)

  let imported = 0
  let skipped = 0
  let errors = 0

  for (const row of rows) {
    if (!row.product_name || !row.brand) {
      console.log(`⚠️  Skipping row with missing name or brand`)
      skipped++
      continue
    }

    const fullName = `${row.brand} ${row.product_name}`
    console.log(`Processing: ${fullName}`)

    // Check if product already exists
    const slug = generateSlug(row.brand, row.product_name)
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('slug', slug)
      .limit(1)

    if (existing && existing.length > 0) {
      console.log(`  ⏭️  Already exists`)
      skipped++
      continue
    }

    // Get brand ID
    const brandId = await getBrandId(row.brand)

    // Get category ID - use 'category TEXT' column instead of 'amazon_category'
    const categoryId = await getCategoryId(row['category TEXT'] || row.amazon_category)

    // Prepare verdict bullets
    const verdictBullets = [
      row.verdict_bullet_1,
      row.verdict_bullet_2,
      row.verdict_bullet_3,
      row.verdict_bullet_4,
      row.verdict_bullet_5
    ].filter(b => b && b.trim())

    // Insert product
    const { error } = await supabase
      .from('products')
      .insert({
        name: row.product_name,
        slug,
        brand_id: brandId,
        category_id: categoryId,
        description: row.amazon_description_full || null,
        excerpt: row.optimized_product_description || null,
        optimized_product_description: row.optimized_product_description || null,
        price: parsePrice(row.price_amazon),
        star_rating: parseFloatSafe(row.star_rating),
        review_count: parseInt(row.review_count) || 0,
        dimensions: row.dimensions || null,
        featured_image_url: row.cover_image_url || null,
        gallery_images: parseGalleryImages(row.gallery_image_urls),
        affiliate_link: row.affiliate_link || null,
        durability_score: parseFloatSafe(row.durability_score),
        durability_notes: row.durability_notes || null,
        repairability_score: parseFloatSafe(row.repairability_score),
        repairability_notes: row.repairability_notes || null,
        warranty_score: parseFloatSafe(row.warranty_score),
        warranty_notes: row.warranty_notes || null,
        sustainability_score: parseFloatSafe(row.sustainability_score),
        sustainability_notes: row.sustainability_notes || null,
        social_score: parseFloatSafe(row.social_score),
        social_notes: row.social_notes || null,
        bifl_total_score: parseFloatSafe(row.bifl_total_score),
        verdict_summary: row.verdict_summary || null,
        verdict_bullets: verdictBullets.length > 0 ? verdictBullets : null,
        lifespan_expectation: parseFloatSafe(row.lifespan_expectation),
        country_of_origin: row.COE || row.country_of_origin || null,
        use_case: row.use_case || null,
        status: 'published',
        wordpress_meta: { brand_name: row.brand }
      })

    if (error) {
      console.log(`  ❌ Error: ${error.message}`)
      errors++
    } else {
      console.log(`  ✅ Imported`)
      imported++
    }

    console.log('')
  }

  console.log('\n=== Import Summary ===')
  console.log(`Total rows: ${rows.length}`)
  console.log(`Imported: ${imported}`)
  console.log(`Skipped (already exists): ${skipped}`)
  console.log(`Errors: ${errors}`)
}

// Run the import
const csvPath = '/Users/stephen/Documents/GitHub/bifl-New/BIFL Score Card - BIFL_Score_Card_ (9).csv'
importProducts(csvPath).catch(console.error)