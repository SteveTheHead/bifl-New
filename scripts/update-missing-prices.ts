import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const priceUpdates = [
  { name: '7.25-Quart Round Dutch Oven', price: 415 },
  { name: 'Hopper M Series Portable Soft Coolers with MagShield Access', price: 240 },
  { name: 'Double Belgian Waffle Maker Stainless Steel WAF-F20P1', price: 140 },
  { name: 'Vinum Cabernet/Merlot Wine Glasses Set of 2', price: 79 },
  { name: 'Sidekick Pocket Size Multitool with Spring-Action Pliers', price: 29.95 },
  { name: 'Focus Steam Iron 1700-Watt Stainless Steel Soleplate DW5080', price: 109 },
]

async function updatePrices() {
  console.log('Updating prices for 6 products...\n')

  for (const update of priceUpdates) {
    // Find product by name (using ilike for case-insensitive partial match)
    const { data: products } = await supabase
      .from('products')
      .select('id, name, price')
      .ilike('name', `%${update.name.split(' ').slice(0, 3).join('%')}%`)
      .limit(5)

    if (!products || products.length === 0) {
      console.log(`❌ Product not found: ${update.name}`)
      continue
    }

    // Find best match
    let bestMatch = products[0]
    if (products.length > 1) {
      // Try to find exact match or closest match
      const exactMatch = products.find(p => p.name === update.name)
      if (exactMatch) {
        bestMatch = exactMatch
      } else {
        console.log(`Multiple matches for "${update.name}":`)
        products.forEach((p, i) => console.log(`  ${i + 1}. ${p.name}`))
        console.log(`  Using: ${bestMatch.name}`)
      }
    }

    // Update price
    const { error } = await supabase
      .from('products')
      .update({ price: update.price })
      .eq('id', bestMatch.id)

    if (error) {
      console.error(`❌ Error updating ${bestMatch.name}:`, error)
    } else {
      console.log(`✅ Updated "${bestMatch.name}": $${bestMatch.price || 'null'} → $${update.price}`)
    }
  }

  console.log('\n✅ Done! All prices updated.')
}

updatePrices()
