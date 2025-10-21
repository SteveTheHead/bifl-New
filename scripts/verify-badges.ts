import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifyBadges() {
  // Delete empty product
  await supabase.from('products').delete().eq('name', '')
  console.log('✅ Deleted empty product\n')

  // Check badge data
  const { data: products } = await supabase
    .from('products')
    .select('name, bifl_certification')
    .limit(10)

  console.log('First 10 products with badges:')
  products?.forEach(p => {
    const badges = Array.isArray(p.bifl_certification)
      ? p.bifl_certification.join(', ')
      : JSON.stringify(p.bifl_certification)
    console.log(`- ${p.name}: [${badges || 'none'}]`)
  })

  // Count products by badge
  const allProducts = await supabase.from('products').select('bifl_certification')
  const badgeCounts = new Map<string, number>()

  allProducts.data?.forEach(p => {
    if (p.bifl_certification && Array.isArray(p.bifl_certification)) {
      p.bifl_certification.forEach((badge: string) => {
        badgeCounts.set(badge, (badgeCounts.get(badge) || 0) + 1)
      })
    }
  })

  console.log('\nBadge counts:')
  const sortedBadges = [...badgeCounts.entries()].sort((a,b) => b[1] - a[1])
  sortedBadges.forEach(([badge, count]) => {
    console.log(`  ${badge}: ${count}`)
  })

  // Total count
  const { count: totalProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })

  console.log(`\n✅ Total products: ${totalProducts}`)
}

verifyBadges()
