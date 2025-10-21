import { createClient } from '@supabase/supabase-js'
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

async function fixCategories() {
  // Read the misassignments file
  const fixesPath = path.join(process.cwd(), 'category-fixes.json')

  if (!fs.existsSync(fixesPath)) {
    console.error('❌ category-fixes.json not found. Run analyze-and-fix-categories.ts first.')
    process.exit(1)
  }

  const misassignments = JSON.parse(fs.readFileSync(fixesPath, 'utf-8'))

  console.log(`\n📝 Fixing ${misassignments.length} product category assignments...\n`)

  let successCount = 0
  let errorCount = 0

  for (const item of misassignments) {
    try {
      const { error } = await supabase
        .from('products')
        .update({ category_id: item.correct_category_id })
        .eq('id', item.product_id)

      if (error) {
        console.error(`❌ Failed to update ${item.product_name}:`, error.message)
        errorCount++
      } else {
        successCount++
        if (successCount % 10 === 0) {
          console.log(`✅ Updated ${successCount}/${misassignments.length} products...`)
        }
      }
    } catch (err: any) {
      console.error(`❌ Error updating ${item.product_name}:`, err.message)
      errorCount++
    }
  }

  console.log(`\n🎉 Category Fix Complete!`)
  console.log(`✅ Successfully updated: ${successCount} products`)
  console.log(`❌ Failed to update: ${errorCount} products`)

  // Clean up
  fs.unlinkSync(fixesPath)
  console.log('\n🗑️  Deleted category-fixes.json')
}

fixCategories().catch(console.error)
