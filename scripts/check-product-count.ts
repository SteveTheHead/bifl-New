import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkCount() {
  // Count total products with status='published'
  const { count: totalCount, error: countError } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')

  console.log('Total published products in database:', totalCount)

  // Try fetching with different limits
  const { data: with1000, error: error1000 } = await supabase
    .from('products_with_taxonomy')
    .select('id')
    .eq('status', 'published')
    .limit(1000)

  console.log('Fetched with limit(1000):', with1000?.length)

  const { data: with10000, error: error10000 } = await supabase
    .from('products_with_taxonomy')
    .select('id')
    .eq('status', 'published')
    .limit(10000)

  console.log('Fetched with limit(10000):', with10000?.length)
}

checkCount()
