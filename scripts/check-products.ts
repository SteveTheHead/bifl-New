import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkIssues() {
  // Get all products
  const { data: allProducts, error } = await supabase
    .from('products')
    .select('id, name, slug, status')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching products:', error)
    return
  }

  console.log('Total products in database:', allProducts?.length || 0)

  // Check for empty names
  const emptyNames = allProducts?.filter(p => !p.name || p.name.trim() === '') || []
  console.log('Products with empty names:', emptyNames.length)
  if (emptyNames.length > 0) {
    console.log(emptyNames)
  }

  // Check for duplicate slugs
  const slugCounts = new Map<string, number>()
  allProducts?.forEach(p => {
    slugCounts.set(p.slug, (slugCounts.get(p.slug) || 0) + 1)
  })

  const duplicates = Array.from(slugCounts.entries()).filter(([_, count]) => count > 1)
  console.log('\nDuplicate slugs:', duplicates.length)
  if (duplicates.length > 0) {
    duplicates.forEach(([slug, count]) => {
      console.log(`  ${slug}: ${count} times`)
      const dupes = allProducts?.filter(p => p.slug === slug)
      dupes?.forEach(d => console.log(`    - ${d.name} (${d.id})`))
    })
  }

  // Count by status
  const published = allProducts?.filter(p => p.status === 'published').length || 0
  const draft = allProducts?.filter(p => p.status === 'draft').length || 0

  console.log('\nStatus breakdown:')
  console.log('  Published:', published)
  console.log('  Draft:', draft)
}

checkIssues()
