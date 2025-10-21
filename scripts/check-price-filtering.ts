import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkPriceFiltering() {
  const { data: products } = await supabase
    .from('products_with_taxonomy')
    .select(`
      id,
      name,
      price,
      status
    `)
    .eq('status', 'published')
    .order('bifl_total_score', { ascending: false })
    .limit(10000)

  console.log(`Total products: ${products?.length || 0}\n`)

  // Calculate price range like the app does
  const prices = products
    ?.map(p => parseFloat(p.price?.toString() || '0'))
    .filter(p => !isNaN(p) && p > 0) || []

  if (prices.length === 0) {
    console.log('No valid prices found')
    return
  }

  const minPrice = Math.floor(Math.min(...prices))
  const maxPrice = Math.ceil(Math.max(...prices))

  console.log(`Calculated price range: $${minPrice} - $${maxPrice}`)
  console.log(`Products with valid prices: ${prices.length}\n`)

  // Now check which products would be filtered out by the price filter
  const filteredOut = products?.filter(product => {
    const price = parseFloat(product.price?.toString() || '0')
    if (isNaN(price)) return false // These are INCLUDED (return true in filter)

    // This is the filter logic - products are EXCLUDED if price is outside range
    return !(price >= minPrice && price <= maxPrice)
  })

  console.log(`Products that would be EXCLUDED by price filter: ${filteredOut?.length || 0}`)

  if (filteredOut && filteredOut.length > 0) {
    filteredOut.forEach(p => {
      const price = parseFloat(p.price?.toString() || '0')
      console.log(`  - ${p.name}: price = "${p.price}" (parsed: ${price})`)
    })
  }

  // Check for products with null/undefined prices
  const noPrices = products?.filter(p => p.price === null || p.price === undefined)
  console.log(`\nProducts with null/undefined price: ${noPrices?.length || 0}`)

  // Check for products with price = 0
  const zeroPrice = products?.filter(p => parseFloat(p.price?.toString() || '0') === 0)
  console.log(`Products with price = 0: ${zeroPrice?.length || 0}`)
  if (zeroPrice && zeroPrice.length > 0) {
    zeroPrice.forEach(p => {
      console.log(`  - ${p.name}: ${p.price}`)
    })
  }
}

checkPriceFiltering()
