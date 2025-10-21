import { createClient } from '@supabase/supabase-js'
import { parse } from 'csv-parse/sync'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Helper functions
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function parseGalleryImages(str: string | null): string[] {
  if (!str) return []
  return str.split(',').map(url => url.trim()).filter(Boolean)
}

function parsePrice(str: string | null): number | null {
  if (!str) return null
  const cleaned = str.replace(/[$,]/g, '')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? null : parsed
}

function parseJSON(str: string | null): any {
  if (!str) return null
  try {
    return JSON.parse(str)
  } catch {
    return null
  }
}

function parseNumber(str: string | null): number | null {
  if (!str) return null
  const parsed = parseFloat(str)
  return isNaN(parsed) ? null : parsed
}

function parseBadges(str: string | null): string[] | null {
  if (!str) return null
  const badges = str.split(',').map(b => b.trim()).filter(Boolean)
  return badges.length > 0 ? badges : null
}

// Brand lookup/create cache
const brandCache = new Map<string, string>()

async function getOrCreateBrand(brandName: string): Promise<string | null> {
  if (!brandName) return null

  // Check cache
  if (brandCache.has(brandName)) {
    return brandCache.get(brandName)!
  }

  const slug = generateSlug(brandName)

  // Try to find existing brand
  const { data: existing } = await supabase
    .from('brands')
    .select('id')
    .eq('name', brandName)
    .single()

  if (existing) {
    brandCache.set(brandName, existing.id)
    return existing.id
  }

  // Create new brand
  const { data: newBrand, error } = await supabase
    .from('brands')
    .insert({
      name: brandName,
      slug: slug,
      is_featured: false
    })
    .select('id')
    .single()

  if (error) {
    console.error(`Error creating brand "${brandName}":`, error)
    return null
  }

  brandCache.set(brandName, newBrand.id)
  return newBrand.id
}

// Category lookup cache - categories are already created in the database
const categoryCache = new Map<string, string>()

async function getCategoryBySubcategory(mainCategory: string, subcategory: string): Promise<string | null> {
  if (!subcategory) return null

  // Remap removed categories to Home & Kitchen
  if (mainCategory === 'Fitness & Exercise' || mainCategory === 'Office & Workspace' || mainCategory === 'Health & Household') {
    mainCategory = 'Home & Kitchen'
  }

  const cacheKey = `${mainCategory}:${subcategory}`

  // Check cache
  if (categoryCache.has(cacheKey)) {
    return categoryCache.get(cacheKey)!
  }

  // Find subcategory by name - subcategories should already exist from SQL migration
  const { data: category, error } = await supabase
    .from('categories')
    .select('id')
    .eq('name', subcategory)
    .single()

  if (error || !category) {
    console.error(`Error finding subcategory "${subcategory}" for main category "${mainCategory}":`, error)
    return null
  }

  categoryCache.set(cacheKey, category.id)
  return category.id
}

async function importProducts() {
  const csvPath = '/Users/stephen/Downloads/BIFL Score Card - BIFL_Score_Card_ (10).csv'

  console.log('📖 Reading CSV file...')
  const fileContent = fs.readFileSync(csvPath, 'utf-8')

  console.log('🔍 Parsing CSV...')
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  })

  // Limit to first 328 products
  const productsToImport = records.slice(0, 328)

  console.log(`📦 Found ${productsToImport.length} products to import\n`)

  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < productsToImport.length; i++) {
    const row = productsToImport[i]

    try {
      // Get or create brand
      const brandId = await getOrCreateBrand(row.brand)

      // Get category (subcategory) - categories are already created in DB
      const categoryId = await getCategoryBySubcategory(row['category TEXT'], row['sub_category TEXT'])

      // Parse verdict bullets
      const verdictBullets = [
        row.verdict_bullet_1,
        row.verdict_bullet_2,
        row.verdict_bullet_3,
        row.verdict_bullet_4,
        row.verdict_bullet_5
      ].filter(Boolean)

      // Build wordpress_meta object
      const wordpressMeta = {
        tags: row.tags || null,
        material: row.material || null,
        category_text: row['category TEXT'] || null,
        sub_category: row['sub_category TEXT'] || null,
        highlight_quote_1: row.highlight_quote_1 || null,
        highlight_quote_2: row.highlight_quote_2 || null
      }

      // Build product object
      const product = {
        name: row.product_name,
        slug: generateSlug(row.product_name),
        description: row.amazon_description_full || null,
        excerpt: row.optimized_product_description?.substring(0, 150) || null,

        brand_id: brandId,
        category_id: categoryId,

        featured_image_url: row.cover_image_url || null,
        gallery_images: parseGalleryImages(row.gallery_image_urls),

        price: parsePrice(row.price_amazon),
        affiliate_link: row.affiliate_link || null,
        manufacturer_link: row.brand_site_link || null,

        star_rating: parseNumber(row.star_rating),
        review_count: parseInt(row.review_count) || 0,
        average_rating: parseNumber(row.star_rating),

        dimensions: row.dimensions || null,
        lifespan_expectation: parseNumber(row.lifespan_expectation),

        durability_score: parseNumber(row.durability_score),
        repairability_score: parseNumber(row.repairability_score),
        warranty_score: parseNumber(row.warranty_score),
        sustainability_score: parseNumber(row.sustainability_score),
        social_score: parseNumber(row.social_score),
        bifl_total_score: parseNumber(row.bifl_total_score),

        durability_notes: row.durability_notes || null,
        repairability_notes: row.repairability_notes || null,
        warranty_notes: row.warranty_notes || null,
        sustainability_notes: row.sustainability_notes || null,
        social_notes: row.social_notes || null,

        verdict_summary: row.verdict_summary || null,
        verdict_bullets: verdictBullets.length > 0 ? verdictBullets : null,

        optimized_product_description: row.optimized_product_description || null,

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

        pro_1: row.pro_1 || null,
        pro_2: row.pro_2 || null,
        pro_3: row.pro_3 || null,
        pro_4: row.pro_4 || null,
        con_1: row.con_1 || null,
        con_2: row.con_2 || null,
        con_3: row.con_3 || null,
        con_4: row.con_4 || null,

        care_and_maintenance: parseJSON(row.care_and_maintenance),

        country_of_origin: row.COE || null,
        manufacturing_notes: row.manufacturing_notes || null,

        use_case: row.use_case || null,

        bifl_certification: parseBadges(row.bifl_certification),

        wordpress_meta: wordpressMeta,

        status: row.Status === 'FINAL REVIEW!!' ? 'published' : 'draft',
        is_featured: false,
        view_count: 0,
        weight: null,
        warranty_years: null
      }

      // Insert product and get the ID
      const { data: insertedProduct, error } = await supabase
        .from('products')
        .insert(product)
        .select('id')
        .single()

      if (error) {
        console.error(`❌ Error importing "${row.product_name}":`, error.message)
        errorCount++
      } else {
        successCount++

        // Validate and log data quality
        const prosCount = [row.pro_1, row.pro_2, row.pro_3, row.pro_4].filter(p => p && String(p).trim()).length
        const consCount = [row.con_1, row.con_2, row.con_3, row.con_4].filter(c => c && String(c).trim()).length
        const dataQuality = []
        if (prosCount > 0) dataQuality.push(`${prosCount} pros`)
        if (consCount > 0) dataQuality.push(`${consCount} cons`)

        console.log(`✅ [${i + 1}/${productsToImport.length}] Imported: ${row.product_name}${dataQuality.length > 0 ? ` (${dataQuality.join(', ')})` : ''}`)

        // Insert FAQs into product_faqs table
        if (insertedProduct?.id) {
          const faqs: any[] = []

          // Collect all FAQs from the CSV row
          for (let faqNum = 1; faqNum <= 5; faqNum++) {
            const questionKey = `faq_${faqNum}_q`
            const answerKey = `faq_${faqNum}_a`
            const question = row[questionKey as keyof typeof row]
            const answer = row[answerKey as keyof typeof row]

            if (question && answer && String(question).trim() && String(answer).trim()) {
              faqs.push({
                product_id: insertedProduct.id,
                question: String(question).trim(),
                answer: String(answer).trim(),
                display_order: faqNum,
                is_active: true
              })
            }
          }

          // Insert FAQs if any exist
          if (faqs.length > 0) {
            const { error: faqError } = await supabase
              .from('product_faqs')
              .insert(faqs)

            if (faqError) {
              console.error(`  ⚠️  Warning: Failed to insert FAQs for "${row.product_name}":`, faqError.message)
            } else {
              console.log(`  ✓ Inserted ${faqs.length} FAQs`)
            }
          }
        }
      }

    } catch (err: any) {
      console.error(`❌ Error processing "${row.product_name}":`, err.message)
      errorCount++
    }
  }

  console.log('\n🎉 Import Complete!')
  console.log(`✅ Successfully imported: ${successCount} products`)
  console.log(`❌ Failed to import: ${errorCount} products`)
}

// Run import
importProducts().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
