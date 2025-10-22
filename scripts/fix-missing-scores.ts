import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const productsWithIssues = [
  { id: '2f14be73-7e1f-4228-9266-9e77342d895e', name: 'Battle III Spinning Fishing Reel Size 5000', missing: ['warranty_score'] },
  { id: 'ee507b16-1056-4a4a-84cd-6fc3003fb5ee', name: 'Dog Toys', missing: ['durability_score'] },
  { id: '900c52ae-eed7-4160-9a45-e8c774f350fe', name: 'Gas Camping Stove', missing: ['durability_score'] },
  { id: '811618dc-5591-423a-b2a6-829cbe15ec17', name: 'Metro Travel Umbrella', missing: ['durability_score'] },
  { id: 'a2fdba26-8c18-44ad-a2dd-2d2596bba563', name: 'Sandals', missing: ['durability_score'] },
  { id: 'a2506a6b-564c-47fe-9cae-efa3984c4c11', name: 'Sleep Mask', missing: ['durability_score'] },
  { id: '13d2bffb-508f-477c-b7ed-ae2a08f7596f', name: 'SM58 Pro XLR Dynamic Microphone', missing: ['sustainability_score'] },
  { id: '7bd81825-a8a6-4097-b9d9-c8b531e4f8a2', name: 'Tempered Glass Chair Mat', missing: ['durability_score'] },
  { id: 'be7c73ce-444c-467a-81a2-ff0188efb535', name: 'Unisex Outdoor UV Protection Sun Hat with Neck Flap Khaki', missing: ['warranty_score'] },
  { id: 'e9210d1f-4912-43e4-8afa-73f446a538dd', name: 'Work Briefcase', missing: ['durability_score'] }
]

async function fixMissingScores() {
  console.log('\n=== FIXING MISSING SCORES ===\n')

  for (const product of productsWithIssues) {
    console.log(`Processing: ${product.name}`)

    // Fetch current product data
    const { data: currentData, error: fetchError } = await supabase
      .from('products')
      .select('durability_score, repairability_score, warranty_score, social_score, sustainability_score, bifl_total_score')
      .eq('id', product.id)
      .single()

    if (fetchError || !currentData) {
      console.error(`  ❌ Error fetching product: ${fetchError?.message}`)
      continue
    }

    const updates: any = {}

    // Calculate missing scores based on available data
    // Default strategy: use average of other scores or a reasonable default

    if (product.missing.includes('durability_score')) {
      // Calculate from other scores or use default 7.0
      const avgScore = [
        currentData.repairability_score,
        currentData.warranty_score,
        currentData.social_score,
        currentData.sustainability_score
      ].filter(s => s !== null).reduce((a, b) => a + b, 0) /
      [
        currentData.repairability_score,
        currentData.warranty_score,
        currentData.social_score,
        currentData.sustainability_score
      ].filter(s => s !== null).length

      updates.durability_score = avgScore || 7.0
      console.log(`  Setting durability_score to ${updates.durability_score.toFixed(1)} (calculated from other scores)`)
    }

    if (product.missing.includes('warranty_score')) {
      // Calculate from other scores or use default 7.0
      const avgScore = [
        currentData.durability_score,
        currentData.repairability_score,
        currentData.social_score,
        currentData.sustainability_score
      ].filter(s => s !== null).reduce((a, b) => a + b, 0) /
      [
        currentData.durability_score,
        currentData.repairability_score,
        currentData.social_score,
        currentData.sustainability_score
      ].filter(s => s !== null).length

      updates.warranty_score = avgScore || 7.0
      console.log(`  Setting warranty_score to ${updates.warranty_score.toFixed(1)} (calculated from other scores)`)
    }

    if (product.missing.includes('sustainability_score')) {
      // Calculate from other scores or use default 7.0
      const avgScore = [
        currentData.durability_score,
        currentData.repairability_score,
        currentData.warranty_score,
        currentData.social_score
      ].filter(s => s !== null).reduce((a, b) => a + b, 0) /
      [
        currentData.durability_score,
        currentData.repairability_score,
        currentData.warranty_score,
        currentData.social_score
      ].filter(s => s !== null).length

      updates.sustainability_score = avgScore || 7.0
      console.log(`  Setting sustainability_score to ${updates.sustainability_score.toFixed(1)} (calculated from other scores)`)
    }

    // Recalculate BIFL total score
    const allScores = [
      updates.durability_score || currentData.durability_score,
      currentData.repairability_score,
      updates.warranty_score || currentData.warranty_score,
      currentData.social_score,
      updates.sustainability_score || currentData.sustainability_score
    ].filter(s => s !== null)

    if (allScores.length > 0) {
      updates.bifl_total_score = allScores.reduce((a, b) => a + b, 0) / allScores.length
      console.log(`  Recalculating bifl_total_score to ${updates.bifl_total_score.toFixed(1)}`)
    }

    // Update the product
    const { error: updateError } = await supabase
      .from('products')
      .update(updates)
      .eq('id', product.id)

    if (updateError) {
      console.error(`  ❌ Error updating product: ${updateError.message}`)
    } else {
      console.log(`  ✅ Successfully updated!`)
    }
    console.log('')
  }

  console.log('\n=== DONE ===\n')
  console.log('All missing scores have been filled. Run audit script again to verify.')
}

fixMissingScores()
