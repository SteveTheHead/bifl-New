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

async function analyzeAndFixCategories() {
  const csvPath = '/Users/stephen/Downloads/BIFL Score Card - BIFL_Score_Card_ (10).csv'

  console.log('📖 Reading CSV file...')
  const fileContent = fs.readFileSync(csvPath, 'utf-8')

  console.log('🔍 Parsing CSV...')
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  })

  // Get all categories from database
  const { data: categories } = await supabase
    .from('categories')
    .select('*')

  // Get all products from database
  const { data: products } = await supabase
    .from('products')
    .select('id, name, category_id')
    .eq('status', 'published')

  console.log('\n=== ANALYZING CSV SUBCATEGORY STRUCTURE ===\n')

  // Analyze CSV data
  const csvSubcategories = new Map<string, Set<string>>()

  records.slice(0, 328).forEach((row: any) => {
    const mainCat = row['category TEXT']
    const subCat = row['sub_category TEXT']

    if (mainCat && subCat) {
      if (!csvSubcategories.has(mainCat)) {
        csvSubcategories.set(mainCat, new Set())
      }
      csvSubcategories.get(mainCat)!.add(subCat)
    }
  })

  // Print CSV structure
  for (const [main, subs] of csvSubcategories.entries()) {
    console.log(`${main}:`)
    Array.from(subs).sort().forEach(sub => {
      const productCount = records.slice(0, 328).filter((r: any) =>
        r['category TEXT'] === main && r['sub_category TEXT'] === sub
      ).length
      console.log(`  → ${sub} (${productCount} products in CSV)`)
    })
    console.log('')
  }

  console.log('\n=== MISMATCHES BETWEEN CSV AND DATABASE ===\n')

  // Find products with wrong subcategories
  const misassignedProducts: any[] = []

  for (const product of products || []) {
    // Find CSV row for this product
    const csvRow = records.find((r: any) => r.product_name === product.name)

    if (csvRow) {
      const csvMainCat = csvRow['category TEXT']
      const csvSubCat = csvRow['sub_category TEXT']

      // Remap removed categories
      let mappedMainCat = csvMainCat
      if (csvMainCat === 'Fitness & Exercise' || csvMainCat === 'Office & Workspace' || csvMainCat === 'Health & Household') {
        mappedMainCat = 'Home & Kitchen'
      }

      // Find intended subcategory in database
      const intendedSubcategory = categories?.find(c =>
        c.name === csvSubCat && categories.some(parent =>
          parent.id === c.parent_id && parent.name === mappedMainCat
        )
      )

      // Check if product is assigned to the correct subcategory
      if (intendedSubcategory && product.category_id !== intendedSubcategory.id) {
        misassignedProducts.push({
          product_id: product.id,
          product_name: product.name,
          current_category_id: product.category_id,
          correct_category_id: intendedSubcategory.id,
          csv_main_cat: csvMainCat,
          csv_sub_cat: csvSubCat
        })
      }
    }
  }

  console.log(`Found ${misassignedProducts.length} misassigned products\n`)

  if (misassignedProducts.length > 0) {
    console.log('Examples:')
    misassignedProducts.slice(0, 10).forEach(p => {
      const currentCat = categories?.find(c => c.id === p.current_category_id)
      console.log(`  • ${p.product_name}`)
      console.log(`    Current: ${currentCat?.name || 'Unknown'}`)
      console.log(`    Should be: ${p.csv_sub_cat}`)
    })

    console.log(`\n... and ${Math.max(0, misassignedProducts.length - 10)} more\n`)

    // Ask if user wants to fix
    console.log('Would you like to fix these assignments? This will update the database.')
    console.log('To proceed, run: npx tsx scripts/fix-categories.ts')

    // Save misassignments to file for review
    fs.writeFileSync(
      path.join(process.cwd(), 'category-fixes.json'),
      JSON.stringify(misassignedProducts, null, 2)
    )
    console.log('\n✅ Saved misassignments to category-fixes.json for review')
  }
}

analyzeAndFixCategories().catch(console.error)
