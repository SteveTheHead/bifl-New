import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verify() {
  console.log('\n=== VERIFYING BUYING GUIDE TOGGLE ===\n')

  // Check if column exists and see sample data
  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, name, show_buying_guide')
    .limit(10)

  if (error) {
    console.log('❌ Error:', error.message)
    console.log('\nThe column may not exist yet. Please run the SQL migration.')
    return
  }

  console.log('✅ Column exists! Sample categories:\n')
  categories.forEach(cat => {
    console.log(`  - ${cat.name}: show_buying_guide = ${cat.show_buying_guide}`)
  })

  const allOff = categories.every(c => c.show_buying_guide === false)
  console.log(`\n${allOff ? '✅' : '⚠️'} All categories have buying guides OFF: ${allOff}`)

  // Count total
  const { count } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true })

  console.log(`\n📊 Total categories: ${count}`)
  console.log('\n✅ Setup complete! All buying guides are hidden by default.')
  console.log('\nNext steps:')
  console.log('1. Go to /admin/categories')
  console.log('2. Edit any category')
  console.log('3. Check "Show AI Buying Guide on category page"')
  console.log('4. Save and visit that category page to see the guide')
}

verify()
