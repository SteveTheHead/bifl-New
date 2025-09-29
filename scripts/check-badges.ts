import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkBadgeData() {
  console.log('Checking imported products with badge certifications...\n')

  const { data: products, error } = await supabase
    .from('products')
    .select('name, bifl_certification, bifl_total_score')
    .not('bifl_certification', 'is', null)
    .limit(15)

  if (error) {
    console.error('Error fetching products:', error)
    return
  }

  console.log(`Found ${products?.length || 0} products with badge certifications:`)
  console.log('='.repeat(80))

  products?.forEach(product => {
    console.log(`📦 ${product.name}`)
    console.log(`   🏆 Badge: ${product.bifl_certification}`)
    console.log(`   📊 BIFL Score: ${product.bifl_total_score || 'N/A'}`)
    console.log('')
  })

  // Check badge distribution
  const { data: badgeStats, error: statsError } = await supabase
    .from('products')
    .select('bifl_certification')
    .not('bifl_certification', 'is', null)

  if (!statsError && badgeStats) {
    console.log('\nBadge Distribution:')
    console.log('='.repeat(40))
    const distribution = badgeStats.reduce((acc: any, product) => {
      acc[product.bifl_certification] = (acc[product.bifl_certification] || 0) + 1
      return acc
    }, {})

    Object.entries(distribution).forEach(([badge, count]) => {
      console.log(`${badge}: ${count} products`)
    })
  }
}

checkBadgeData()
  .then(() => process.exit(0))
  .catch(console.error)