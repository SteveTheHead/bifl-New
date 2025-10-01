import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkVerdictSummary() {
  const { data, error } = await supabase
    .from('products')
    .select('name, verdict_summary')
    .not('verdict_summary', 'is', null)
    .limit(5)

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log('Sample products with verdict_summary:\n')
  data?.forEach(product => {
    console.log(`Product: ${product.name}`)
    console.log(`Verdict Summary: ${product.verdict_summary?.substring(0, 150)}...`)
    console.log('')
  })
}

checkVerdictSummary()
