import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { parse } from 'csv-parse/sync'
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
  amazon_description_short: string
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
  bifl_certification: string
  badge: string
  'category TEXT': string
  category: string
  'sub_category TEXT': string
  sub_category: string
  tags: string
  use_case: string
}

function parseScore(value: string): number | null {
  if (!value || value.trim() === '') return null
  const parsed = parseFloat(value)
  return isNaN(parsed) ? null : Math.min(10, Math.max(1, parsed))
}

function parsePrice(value: string): number | null {
  if (!value || value.trim() === '') return null
  const cleaned = value.replace(/[$,]/g, '')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? null : parsed
}

function parseLifespan(value: string): number | null {
  if (!value || value.trim() === '') return null

  // Extract number from strings like "5-10+ years", "10 years", "25+ years"
  const match = value.match(/(\d+)/)
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

async function importProducts(csvFilePath: string, limit = 100) {
  console.log(`🚀 Starting import from ${csvFilePath}...`)

  try {
    // Read and parse CSV
    const csvContent = readFileSync(csvFilePath, 'utf-8')
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    }) as CSVRow[]

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

async function processProduct(row: CSVRow) {
  if (!row.product_name || !row.brand || row.Status !== 'PUBLISHED') {
    console.log(`⏭️ Skipping ${row.product_name} - missing data or not published`)
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

    const productData = {
      name: row.product_name,
      slug: productSlug,
      description: row.amazon_description_full || row.amazon_description_short || null,
      excerpt: row.optimized_product_description || null,
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
      pros: parseArrayField(''), // Would need to parse from verdict bullets
      cons: parseArrayField(''), // Would need to parse from verdict bullets
      key_features: parseArrayField(''), // Would need to parse from about fields
      verdict_summary: row.verdict_summary || null,
      verdict_bullets: parseVerdictBullets(
        row.verdict_bullet_1,
        row.verdict_bullet_2,
        row.verdict_bullet_3,
        row.verdict_bullet_4,
        row.verdict_bullet_5
      ),
      durability_notes: row.durability_notes || null,
      repairability_notes: row.repairability_notes || null,
      warranty_notes: row.warranty_notes || null,
      sustainability_notes: row.sustainability_notes || null,
      social_notes: row.social_notes || null,
      country_of_origin: row.country_of_origin || null,
      use_case: row.use_case || null,
      is_featured: false,
      status: 'published',
      view_count: 0,
      review_count: parseInt(row.review_count) || 0,
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
const csvFilePath = process.argv[2] || '/Users/stephen/Downloads/BIFL Score Card - BIFL_Score_Card_ (9).csv'
const limit = parseInt(process.argv[3]) || 100

importProducts(csvFilePath, limit)