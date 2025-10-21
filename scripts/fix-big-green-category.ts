import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function fixBigGreenCategory() {
  console.log('Fixing Big Green Carpet Cleaner category...\n')

  // First, let's find categories related to cleaning
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, parent_id')
    .or('name.ilike.%clean%,name.ilike.%vacuum%,name.ilike.%carpet%')

  console.log('Found cleaning-related categories:')
  categories?.forEach(cat => {
    console.log(`  - ${cat.name} (${cat.slug}) - ID: ${cat.id}`)
  })

  // Look for "Cleaning Tools" specifically
  const { data: cleaningTools } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('slug', 'cleaning-tools')
    .single()

  if (!cleaningTools) {
    console.log('\n⚠️  "Cleaning Tools" category not found')

    // Try to find "Home & Kitchen" as fallback
    const { data: homeKitchen } = await supabase
      .from('categories')
      .select('id, name, slug')
      .eq('slug', 'home-kitchen')
      .single()

    if (homeKitchen) {
      console.log(`\nUsing fallback category: ${homeKitchen.name}`)

      // Update product
      const { error } = await supabase
        .from('products')
        .update({ category_id: homeKitchen.id })
        .eq('id', '4d06af93-e4c9-44d0-a269-d6f76e9fa41d')

      if (error) {
        console.error('❌ Error updating product:', error)
      } else {
        console.log(`✅ Updated Big Green Carpet Cleaner with category: ${homeKitchen.name}`)
      }
    }
  } else {
    console.log(`\nFound category: ${cleaningTools.name}`)

    // Update product
    const { error } = await supabase
      .from('products')
      .update({ category_id: cleaningTools.id })
      .eq('id', '4d06af93-e4c9-44d0-a269-d6f76e9fa41d')

    if (error) {
      console.error('❌ Error updating product:', error)
    } else {
      console.log(`✅ Updated Big Green Carpet Cleaner with category: ${cleaningTools.name}`)
    }
  }

  // Verify the update
  const { data: product } = await supabase
    .from('products_with_taxonomy')
    .select('id, name, category_name')
    .eq('id', '4d06af93-e4c9-44d0-a269-d6f76e9fa41d')
    .single()

  console.log(`\nVerification: ${product?.name} → Category: ${product?.category_name}`)
}

fixBigGreenCategory()
