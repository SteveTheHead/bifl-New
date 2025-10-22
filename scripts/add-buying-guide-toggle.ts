import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addBuyingGuideToggle() {
  console.log('\n=== ADDING BUYING GUIDE TOGGLE TO CATEGORIES ===\n')

  console.log('⚠️  Please run this SQL in Supabase SQL Editor first:')
  console.log('')
  console.log('ALTER TABLE categories ADD COLUMN IF NOT EXISTS show_buying_guide BOOLEAN DEFAULT false;')
  console.log('')
  console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue with setting values...')

  await new Promise(resolve => setTimeout(resolve, 5000))

  // Set all existing categories to false
  const { data: categories, error: fetchError } = await supabase
    .from('categories')
    .select('id, name, show_buying_guide')

  if (fetchError) {
    console.error('❌ Error fetching categories:', fetchError)
    return
  }

  console.log(`\nFound ${categories.length} categories`)

  // Update all to false
  const { error: updateError } = await supabase
    .from('categories')
    .update({ show_buying_guide: false })
    .neq('id', '00000000-0000-0000-0000-000000000000') // Update all

  if (updateError) {
    console.error('❌ Error updating categories:', updateError)
    return
  }

  console.log('✅ Set all categories to show_buying_guide = false')

  // Verify
  const { count } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true })
    .eq('show_buying_guide', false)

  console.log(`\n📊 Categories with buying guides OFF: ${count}`)
  console.log('\n✅ Done! All buying guides are now hidden by default.')
}

addBuyingGuideToggle()
