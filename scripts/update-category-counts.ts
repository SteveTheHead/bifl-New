import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function updateCategoryCounts() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  console.log('📊 Updating category product counts...')

  // Get all categories
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('id, name')

  if (categoriesError) {
    console.error('Error fetching categories:', categoriesError)
    return
  }

  // Update product count for each category
  for (const category of categories) {
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', category.id)
      .eq('status', 'published')

    if (countError) {
      console.error(`Error counting products for ${category.name}:`, countError)
      continue
    }

    // Update the category with the product count
    const { error: updateError } = await supabase
      .from('categories')
      .update({ product_count: count || 0 })
      .eq('id', category.id)

    if (updateError) {
      console.error(`Error updating count for ${category.name}:`, updateError)
    } else {
      console.log(`✅ ${category.name}: ${count || 0} products`)
    }
  }

  console.log('📊 Category counts updated!')
}

updateCategoryCounts().catch(console.error)