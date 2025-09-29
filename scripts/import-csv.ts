import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import csv from 'csv-parser'
import dotenv from 'dotenv'
import { Database } from '../lib/supabase/types'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey) as any

interface CSVRow {
  brand: string
  product_name: string
  amazon_link: string
  affiliate_link: string
  asin: string
  Status: string
  stage: string
  workflow_error: string
  error_message: string
  'time stamp': string
  amazon_review_report: string
  reddit_report: string
  bifl_reddit_report: string
  review_site_report: string
  brand_site_link: string
  warranty_report: string
  byline_link: string
  cover_image_url: string
  gallery_image_urls: string
  price_amazon: string
  original_price_amazon: string
  star_rating: string
  review_count: string
  sales_volume: string
  availability: string
  amazon_climate_pledge: string
  amazon_category: string
  'amazon_description-short': string
  amazon_description_full: string
  material: string
  dimensions: string
  fuel_type: string
  about_1: string
  about_2: string
  about_3: string
  about_4: string
  about_5: string
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
  source_count: string
  highlight_quote_1: string
  highlight_quote_2: string
  post_id: string
  post_link: string
}

async function generateSlug(name: string): Promise<string> {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function findOrCreateBrand(brandName: string): Promise<string> {
  if (!brandName) return ''

  const slug = await generateSlug(brandName)

  let { data: brand } = await supabase
    .from('brands')
    .select('id')
    .or(`slug.eq.${slug},name.eq.${brandName}`)
    .single()

  if (!brand) {
    const { data: newBrand, error } = await (supabase as any)
      .from('brands')
      .insert({
        name: brandName,
        slug: slug,
        is_featured: false
      })
      .select('id')
      .single()

    if (error && error.code !== '23505') {
      console.error('Error creating brand:', error)
      return ''
    }

    if (error && error.code === '23505') {
      const { data: existingBrand } = await supabase
        .from('brands')
        .select('id')
        .or(`slug.eq.${slug},name.eq.${brandName}`)
        .single()
      return (existingBrand as any)?.id || ''
    }

    brand = newBrand
  }

  return (brand as any).id
}

async function findOrCreateCategory(categoryName: string): Promise<string> {
  if (!categoryName) return ''

  const slug = await generateSlug(categoryName)

  let { data: category } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!category) {
    const { data: newCategory, error } = await supabase
      .from('categories')
      .insert({
        name: categoryName,
        slug: slug,
        display_order: 99,
        is_featured: false
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error creating category:', error)
      return ''
    }
    category = newCategory
  }

  return category.id
}

async function importProducts(csvPath: string) {
  const products: any[] = []

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', async (row: CSVRow) => {
        try {
          const brandId = await findOrCreateBrand(row.brand)
          const categoryId = await findOrCreateCategory(row.category)

          const slug = await generateSlug(row.product_name)

          const product = {
            name: row.product_name,
            slug: slug || `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            description: row.amazon_description_full || null,
            excerpt: row['amazon_description-short'] || null,
            optimized_product_description: row.optimized_product_description || null,
            brand_id: brandId || null,
            category_id: categoryId || null,
            price: row.price_amazon ? parseFloat(row.price_amazon.replace('$', '')) : null,
            dimensions: row.dimensions || null,
            featured_image_url: row.cover_image_url || null,
            gallery_images: row.gallery_image_urls ? JSON.stringify(row.gallery_image_urls.split(', ')) : null,
            affiliate_link: row.affiliate_link || null,
            star_rating: row.star_rating ? parseFloat(row.star_rating) : null,
            bifl_total_score: row.bifl_total_score && parseFloat(row.bifl_total_score) > 0 ? parseFloat(row.bifl_total_score) : null,
            durability_score: row.durability_score && parseFloat(row.durability_score) > 0 ? parseFloat(row.durability_score) : null,
            repairability_score: row.repairability_score && parseFloat(row.repairability_score) > 0 ? parseFloat(row.repairability_score) : null,
            sustainability_score: row.sustainability_score && parseFloat(row.sustainability_score) > 0 ? parseFloat(row.sustainability_score) : null,
            social_score: row.social_score && parseFloat(row.social_score) > 0 ? parseFloat(row.social_score) : null,
            warranty_score: row.warranty_score && parseFloat(row.warranty_score) > 0 ? parseFloat(row.warranty_score) : null,
            durability_notes: row.durability_notes || null,
            repairability_notes: row.repairability_notes || null,
            sustainability_notes: row.sustainability_notes || null,
            social_notes: row.social_notes || null,
            warranty_notes: row.warranty_notes || null,
            verdict_summary: row.verdict_summary || null,
            verdict_bullets: row.verdict_bullet_1 ? JSON.stringify([
              row.verdict_bullet_1,
              row.verdict_bullet_2,
              row.verdict_bullet_3,
              row.verdict_bullet_4,
              row.verdict_bullet_5
            ].filter(Boolean)) : null,
            country_of_origin: row.country_of_origin || null,
            use_case: row.use_case || null,
            lifespan_expectation: row.lifespan_expectation ? parseInt(row.lifespan_expectation.replace(/[^0-9]/g, '')) : null,
            bifl_certification: row.bifl_certification || null,
            status: row.Status?.toLowerCase() === 'published' ? 'published' : 'draft',
            is_featured: false,
            view_count: 0,
            review_count: row.review_count ? parseInt(row.review_count.replace(/[^0-9]/g, '')) : 0,
            average_rating: row.star_rating ? parseFloat(row.star_rating) : null
          }

          products.push(product)
        } catch (error) {
          console.error('Error processing row:', error)
        }
      })
      .on('end', async () => {
        console.log(`Parsed ${products.length} products from CSV`)

        const { data, error } = await supabase
          .from('products')
          .insert(products)
          .select()

        if (error) {
          console.error('Error inserting products:', error)
          reject(error)
        } else {
          console.log(`Successfully imported ${data.length} products`)
          resolve(data)
        }
      })
      .on('error', reject)
  })
}

const csvPath = process.argv[2] || '/Users/stephen/Downloads/BIFL Score Card - BIFL_Score_Card_ (9).csv'

importProducts(csvPath)
  .then(() => {
    console.log('Import completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Import failed:', error)
    process.exit(1)
  })