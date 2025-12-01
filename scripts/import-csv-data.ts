import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { parse } from 'csv-parse/sync'
import * as XLSX from 'xlsx'
import { Database } from '../lib/supabase/types'

// Load environment variables
config({ path: '.env.local' })

// Initialize Supabase client with service key for admin operations
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface CSVRow {
  brand: string
  product_name: string
  amazon_link: string
  affiliate_link: string
  asin: string
  Status: string
  cover_image_url: string
  gallery_image_urls: string
  price_amazon: string
  original_price_amazon: string
  star_rating: string
  review_count: string
  amazon_category: string
  // Support both hyphen (Excel) and underscore (CSV) versions
  'amazon_description-short'?: string
  amazon_description_short?: string
  amazon_description_full: string
  material: string
  dimensions: string
  // About fields for key_features
  about_1?: string
  about_2?: string
  about_3?: string
  about_4?: string
  about_5?: string
  // Scores and notes
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
  // FAQ fields
  faq_1_q?: string
  faq_1_a?: string
  faq_2_q?: string
  faq_2_a?: string
  faq_3_q?: string
  faq_3_a?: string
  faq_4_q?: string
  faq_4_a?: string
  faq_5_q?: string
  faq_5_a?: string
  // Pro/Con fields
  pro_1?: string
  pro_2?: string
  pro_3?: string
  pro_4?: string
  con_1?: string
  con_2?: string
  con_3?: string
  con_4?: string
  // Additional fields
  care_and_maintenance?: string
  COE: string
  country_of_origin?: string
  manufacturing_notes?: string
  bifl_certification: string
  badge?: string
  'category TEXT': string
  category?: string
  'sub_category TEXT': string
  sub_category?: string
  tags: string
  use_case: string
  // Highlight quotes
  highlight_quote_1?: string
  highlight_quote_2?: string
}

function parseScore(value: string | number | undefined | null): number | null {
  if (value === undefined || value === null || value === '') return null
  // If it's already a number, use it directly
  if (typeof value === 'number') {
    return isNaN(value) ? null : Math.min(10, Math.max(1, value))
  }
  // If it's a string, parse it
  const trimmed = String(value).trim()
  if (trimmed === '') return null
  const parsed = parseFloat(trimmed)
  return isNaN(parsed) ? null : Math.min(10, Math.max(1, parsed))
}

function parsePrice(value: string | number | undefined | null): number | null {
  if (value === undefined || value === null || value === '') return null
  // If it's already a number, use it directly
  if (typeof value === 'number') {
    return isNaN(value) ? null : value
  }
  // If it's a string, clean and parse it
  const cleaned = String(value).replace(/[$,]/g, '').trim()
  if (cleaned === '') return null
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? null : parsed
}

function parseLifespan(value: string | number | undefined | null): number | null {
  if (value === undefined || value === null || value === '') return null
  // If it's already a number, use it directly
  if (typeof value === 'number') {
    return isNaN(value) ? null : Math.floor(value)
  }
  const strValue = String(value).trim()
  if (strValue === '') return null
  // Extract number from strings like "5-10+ years", "10 years", "25+ years"
  const match = strValue.match(/(\d+)/)
  if (match) {
    return parseInt(match[1])
  }
  return null
}

function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function parseImageGallery(galleryString: string): string[] {
  if (!galleryString || galleryString.trim() === '') return []

  return galleryString
    .split(',')
    .map(url => url.trim())
    .filter(url => url.length > 0)
}

function parseArrayField(value: string): string[] {
  if (!value || value.trim() === '') return []

  return [value.trim()]
}

function parseVerdictBullets(...bullets: string[]): string[] {
  return bullets
    .filter(bullet => bullet && bullet.trim() !== '')
    .map(bullet => bullet.trim())
}

function parseKeyFeatures(...aboutFields: (string | undefined)[]): string[] {
  return aboutFields
    .filter((field): field is string => !!field && field.trim() !== '')
    .map(field => field.trim())
}

function parseProsOrCons(...fields: (string | undefined)[]): string[] {
  return fields
    .filter((field): field is string => !!field && field.trim() !== '')
    .map(field => field.trim())
}

function parseCareAndMaintenance(value: string | undefined): object | null {
  if (!value || value.trim() === '') return null
  try {
    return JSON.parse(value)
  } catch {
    // If not valid JSON, return as a simple object with the text
    return { notes: value.trim() }
  }
}

function parseBiflCertification(value: string | undefined): string[] | null {
  if (!value || value.trim() === '') return null
  // Split by comma and clean up each certification
  return value.split(',').map(cert => cert.trim()).filter(cert => cert.length > 0)
}

function getDescriptionShort(row: CSVRow): string {
  // Handle both hyphen (Excel) and underscore (CSV) versions
  return row['amazon_description-short'] || row.amazon_description_short || ''
}

async function importProducts(filePath: string, limit = 100, sheetName = 'Import') {
  console.log(`🚀 Starting import from ${filePath}...`)

  try {
    let records: CSVRow[]

    // Check if file is Excel or CSV
    if (filePath.endsWith('.xlsx') || filePath.endsWith('.xls')) {
      // Read Excel file
      console.log(`📑 Reading Excel file, sheet: "${sheetName}"...`)
      const workbook = XLSX.readFile(filePath)

      if (!workbook.SheetNames.includes(sheetName)) {
        console.error(`❌ Sheet "${sheetName}" not found. Available sheets: ${workbook.SheetNames.join(', ')}`)
        process.exit(1)
      }

      const sheet = workbook.Sheets[sheetName]
      records = XLSX.utils.sheet_to_json(sheet) as CSVRow[]
    } else {
      // Read CSV file
      console.log(`📑 Reading CSV file...`)
      const csvContent = readFileSync(filePath, 'utf-8')
      records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      }) as CSVRow[]
    }

    console.log(`📊 Found ${records.length} total records, importing first ${limit}...`)

    // Process records in batches
    const batchSize = 10
    const recordsToProcess = records.slice(0, limit)

    for (let i = 0; i < recordsToProcess.length; i += batchSize) {
      const batch = recordsToProcess.slice(i, i + batchSize)
      console.log(`⏳ Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(recordsToProcess.length/batchSize)}...`)

      for (const row of batch) {
        await processProduct(row)
      }
    }

    console.log(`✅ Import completed! Processed ${recordsToProcess.length} products.`)

  } catch (error) {
    console.error('❌ Import failed:', error)
    process.exit(1)
  }
}

// Acceptable status values for import
const VALID_STATUSES = ['PUBLISHED', 'FINAL REVIEW!!', 'FINAL REVIEW']

async function processProduct(row: CSVRow) {
  if (!row.product_name || !row.brand || !VALID_STATUSES.includes(row.Status)) {
    console.log(`⏭️ Skipping ${row.product_name || 'unknown'} - missing data or status "${row.Status}" not in: ${VALID_STATUSES.join(', ')}`)
    return
  }

  try {
    // First, ensure brand exists
    const brandSlug = createSlug(row.brand)
    let brandId: string

    const { data: existingBrand } = await supabase
      .from('brands')
      .select('id')
      .eq('slug', brandSlug)
      .single()

    if (existingBrand) {
      brandId = (existingBrand as any).id
    } else {
      const { data: newBrand } = await (supabase as any)
        .from('brands')
        .insert({
          name: row.brand,
          slug: brandSlug,
          is_featured: false
        })
        .select('id')
        .single()

      brandId = newBrand!.id
      console.log(`🏷️ Created brand: ${row.brand}`)
    }

    // Map category - create if doesn't exist
    let categoryId: string | null = null
    const categoryText = row['category TEXT']
    const subCategoryText = row['sub_category TEXT']

    if (categoryText && categoryText.trim() !== '') {
      const categorySlug = createSlug(categoryText)
      const { data: existingCategory } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .single()

      if (existingCategory) {
        categoryId = (existingCategory as any).id
      } else {
        const { data: newCategory } = await (supabase as any)
          .from('categories')
          .insert({
            name: categoryText,
            slug: categorySlug,
            description: `Products in the ${categoryText} category`,
            display_order: 99
          })
          .select('id')
          .single()

        categoryId = newCategory!.id
        console.log(`📁 Created category: ${categoryText}`)
      }
    }

    // Parse price range
    let priceRangeId: string | null = null
    const price = parsePrice(row.price_amazon)
    if (price) {
      const { data: priceRanges } = await supabase
        .from('price_ranges')
        .select('*')
        .order('display_order')

      if (priceRanges) {
        for (const range of priceRanges) {
          if ((range as any).min_price && (range as any).max_price) {
            if (price >= (range as any).min_price && price <= (range as any).max_price) {
              priceRangeId = (range as any).id
              break
            }
          } else if ((range as any).min_price && price >= (range as any).min_price) {
            priceRangeId = (range as any).id
            break
          }
        }
      }
    }

    // Create product
    const productSlug = createSlug(`${row.brand} ${row.product_name}`)
    const descriptionShort = getDescriptionShort(row)

    const productData = {
      name: row.product_name,
      slug: productSlug,
      description: row.amazon_description_full || descriptionShort || null,
      excerpt: row.optimized_product_description || null,
      optimized_product_description: row.optimized_product_description || null,
      brand_id: brandId,
      category_id: categoryId,
      price_range_id: priceRangeId,
      durability_score: parseScore(row.durability_score),
      repairability_score: parseScore(row.repairability_score),
      warranty_score: parseScore(row.warranty_score),
      sustainability_score: parseScore(row.sustainability_score),
      social_score: parseScore(row.social_score),
      bifl_total_score: parseScore(row.bifl_total_score),
      star_rating: parseScore(row.star_rating),
      price: parsePrice(row.price_amazon),
      dimensions: row.dimensions || null,
      lifespan_expectation: parseLifespan(row.lifespan_expectation),
      featured_image_url: row.cover_image_url || null,
      gallery_images: parseImageGallery(row.gallery_image_urls),
      affiliate_link: row.affiliate_link || null,
      manufacturer_link: row.amazon_link || null,
      // Pros and cons - both as array and individual fields
      pros: parseProsOrCons(row.pro_1, row.pro_2, row.pro_3, row.pro_4),
      cons: parseProsOrCons(row.con_1, row.con_2, row.con_3, row.con_4),
      pro_1: row.pro_1 || null,
      pro_2: row.pro_2 || null,
      pro_3: row.pro_3 || null,
      pro_4: row.pro_4 || null,
      con_1: row.con_1 || null,
      con_2: row.con_2 || null,
      con_3: row.con_3 || null,
      con_4: row.con_4 || null,
      // Key features from about fields
      key_features: parseKeyFeatures(row.about_1, row.about_2, row.about_3, row.about_4, row.about_5),
      verdict_summary: row.verdict_summary || null,
      verdict_bullets: parseVerdictBullets(
        row.verdict_bullet_1,
        row.verdict_bullet_2,
        row.verdict_bullet_3,
        row.verdict_bullet_4,
        row.verdict_bullet_5
      ),
      // Score notes
      durability_notes: row.durability_notes || null,
      repairability_notes: row.repairability_notes || null,
      warranty_notes: row.warranty_notes || null,
      sustainability_notes: row.sustainability_notes || null,
      social_notes: row.social_notes || null,
      // FAQ fields
      faq_1_q: row.faq_1_q || null,
      faq_1_a: row.faq_1_a || null,
      faq_2_q: row.faq_2_q || null,
      faq_2_a: row.faq_2_a || null,
      faq_3_q: row.faq_3_q || null,
      faq_3_a: row.faq_3_a || null,
      faq_4_q: row.faq_4_q || null,
      faq_4_a: row.faq_4_a || null,
      faq_5_q: row.faq_5_q || null,
      faq_5_a: row.faq_5_a || null,
      // Additional fields
      care_and_maintenance: parseCareAndMaintenance(row.care_and_maintenance),
      country_of_origin: row.country_of_origin || row.COE || null,  // Map COE to country_of_origin
      manufacturing_notes: row.manufacturing_notes || null,
      bifl_certification: parseBiflCertification(row.bifl_certification),
      use_case: row.use_case || null,
      is_featured: false,
      status: 'published',
      view_count: 0,
      review_count: typeof row.review_count === 'number' ? row.review_count : (parseInt(row.review_count) || 0),
      average_rating: parseScore(row.star_rating)
    }

    const { error } = await (supabase as any)
      .from('products')
      .insert(productData)

    if (error) {
      console.error(`❌ Failed to insert ${row.product_name}:`, error.message)
    } else {
      console.log(`✅ Imported: ${row.brand} - ${row.product_name}`)
    }

  } catch (error) {
    console.error(`❌ Error processing ${row.product_name}:`, error)
  }
}

// Run the import
// Usage: npx tsx scripts/import-csv-data.ts [file_path] [limit] [sheet_name]
// Examples:
//   npx tsx scripts/import-csv-data.ts "BIFL Score Card (5).xlsx" 100 Import
//   npx tsx scripts/import-csv-data.ts data.csv 50
const filePath = process.argv[2] || 'BIFL Score Card (5).xlsx'
const limit = parseInt(process.argv[3]) || 100
const sheetName = process.argv[4] || 'Import'

importProducts(filePath, limit, sheetName)