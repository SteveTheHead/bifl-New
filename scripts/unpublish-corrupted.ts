import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const corruptedProductIds = [
  'ea8fae7d-0423-4747-8c62-ad8e24dedf91', // 289 Multimeter
  '2f14be73-7e1f-4228-9266-9e77342d895e', // Battle III Spinning Fishing Reel Size 5000
  'ee507b16-1056-4a4a-84cd-6fc3003fb5ee', // Dog Toys
  '64d11973-0429-4ef8-b85d-8a855c3799d0', // Espresso Machine
  'd5b5c256-80bc-4bda-a3d3-527a10b905f4', // ET-ZLC30 Toaster Oven
  '0050842d-cdca-43e6-94f2-42b17011db41', // F300 Sewing Machine
  'a9ba668b-43f0-4bcf-8d47-6cb5d0a61474', // Fuzzy Rice Cooker
  '900c52ae-eed7-4160-9a45-e8c774f350fe', // Gas Camping Stove
  'fa4443a7-071e-42da-9e54-1f864560597c', // MC-2 Compass
  '811618dc-5591-423a-b2a6-829cbe15ec17', // Metro Travel Umbrella
  '82afeea7-32b1-4d10-ae08-016889486ae2', // Nest Hammocks
  'bfa7ac45-bf37-491b-9063-f52e5d23ecf3', // Platinum BP5450
  '7de25845-78fa-4b0c-9c37-a85489d7b33f', // Racing Tire Pressure Gauge
  'a2fdba26-8c18-44ad-a2dd-2d2596bba563', // Sandals
  'a2506a6b-564c-47fe-9cae-efa3984c4c11', // Sleep Mask
  '7bd81825-a8a6-4097-b9d9-c8b531e4f8a2', // Tempered Glass Chair Mat
  '81a3e40f-01e6-4e91-acdc-ddad4c042678', // Travel Gear
  'be7c73ce-444c-467a-81a2-ff0188efb535', // Unisex Outdoor UV Protection Sun Hat with Neck Flap Khaki
  '40d6e058-d004-45a4-9a89-b6b8019a71e4', // Vinum Cabernet/Merlot Wine Glasses Set of 2
  'e9210d1f-4912-43e4-8afa-73f446a538dd', // Work Briefcase
]

async function unpublishCorrupted() {
  console.log('\n=== UNPUBLISHING CORRUPTED PRODUCTS ===\n')

  // Get product names first
  const { data: products } = await supabase
    .from('products')
    .select('id, name, status')
    .in('id', corruptedProductIds)

  if (!products) {
    console.log('No products found')
    return
  }

  console.log(`Found ${products.length} products to unpublish:\n`)

  for (const product of products) {
    console.log(`- ${product.name} (currently: ${product.status})`)
  }

  console.log('\nUnpublishing...\n')

  // Unpublish all at once
  const { data, error } = await supabase
    .from('products')
    .update({ status: 'draft' })
    .in('id', corruptedProductIds)
    .select('name')

  if (error) {
    console.error('❌ Error unpublishing:', error.message)
    return
  }

  console.log(`✅ Successfully unpublished ${data?.length || 0} products`)

  // Verify final count
  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')

  console.log(`\n📊 Published products remaining: ${count}`)
}

unpublishCorrupted()
