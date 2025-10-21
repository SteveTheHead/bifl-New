import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkCategories() {
  // Get all categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  // Get all products with their categories
  const { data: products } = await supabase
    .from('products')
    .select('id, name, category_id, wordpress_meta')
    .eq('status', 'published')
    .order('name')

  console.log('\n=== CATEGORY STRUCTURE ===\n')

  // Group categories by parent
  const mainCategories = categories?.filter(c => !c.parent_id) || []

  for (const main of mainCategories) {
    const subcats = categories?.filter(c => c.parent_id === main.id) || []
    const productCount = products?.filter(p => {
      if (p.category_id === main.id) return true
      return subcats.some(sub => sub.id === p.category_id)
    }).length || 0

    console.log(`${main.name} (${productCount} products)`)

    for (const sub of subcats) {
      const subProducts = products?.filter(p => p.category_id === sub.id) || []
      console.log(`  → ${sub.name} (${subProducts.length} products)`)

      // Show first few products in this subcategory
      if (subProducts.length > 0) {
        subProducts.slice(0, 3).forEach(p => {
          const wpMeta = p.wordpress_meta as any
          const originalCat = wpMeta?.sub_category || wpMeta?.category_text || 'Unknown'
          console.log(`      • ${p.name} (original: ${originalCat})`)
        })
        if (subProducts.length > 3) {
          console.log(`      ... and ${subProducts.length - 3} more`)
        }
      }
    }
    console.log('')
  }

  // Check for products assigned to main categories
  console.log('\n=== PRODUCTS ASSIGNED TO MAIN CATEGORIES (Should be in subcategories) ===\n')
  for (const main of mainCategories) {
    const directProducts = products?.filter(p => p.category_id === main.id) || []
    if (directProducts.length > 0) {
      console.log(`${main.name}: ${directProducts.length} products`)
      directProducts.forEach(p => {
        const wpMeta = p.wordpress_meta as any
        const originalCat = wpMeta?.sub_category || wpMeta?.category_text || 'Unknown'
        console.log(`  • ${p.name} (original subcategory: ${originalCat})`)
      })
      console.log('')
    }
  }
}

checkCategories().catch(console.error)
