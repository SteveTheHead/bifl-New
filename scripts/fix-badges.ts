import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixBadges() {
  console.log('🔍 Fetching all products...')

  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, bifl_certification')

  if (error) {
    console.error('Error fetching products:', error)
    return
  }

  console.log(`Found ${products?.length} products\n`)

  let fixed = 0
  let skipped = 0

  for (const product of products || []) {
    if (!product.bifl_certification) {
      skipped++
      continue
    }

    // Check if it's a JSON string that needs parsing
    let badges: string[] | null = null

    if (typeof product.bifl_certification === 'string') {
      try {
        const parsed = JSON.parse(product.bifl_certification)
        if (Array.isArray(parsed)) {
          badges = parsed
        }
      } catch {
        // If it fails to parse, split by comma
        badges = product.bifl_certification.split(',').map(b => b.trim()).filter(Boolean)
      }
    } else if (Array.isArray(product.bifl_certification)) {
      // Check if array contains JSON strings
      const firstItem = product.bifl_certification[0]
      if (typeof firstItem === 'string' && firstItem.startsWith('[')) {
        try {
          badges = JSON.parse(firstItem)
        } catch {
          badges = product.bifl_certification
        }
      } else {
        badges = product.bifl_certification
      }
    }

    if (badges && badges.length > 0) {
      const { error: updateError } = await supabase
        .from('products')
        .update({ bifl_certification: badges })
        .eq('id', product.id)

      if (updateError) {
        console.error(`Error updating ${product.name}:`, updateError)
      } else {
        console.log(`✅ Fixed: ${product.name} -> [${badges.join(', ')}]`)
        fixed++
      }
    } else {
      skipped++
    }
  }

  console.log(`\n🎉 Complete!`)
  console.log(`✅ Fixed: ${fixed} products`)
  console.log(`⏭️  Skipped: ${skipped} products (no badges)`)
}

fixBadges()
