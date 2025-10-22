import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkBriggsRiley() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', 'e9210d1f-4912-43e4-8afa-73f446a538dd')
    .single()

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log('\n=== Briggs & Riley Work Briefcase ===\n')
  console.log('Product Name:', data.name)
  console.log('\nScores:')
  console.log('  durability_score:', data.durability_score || 'MISSING')
  console.log('  repairability_score:', data.repairability_score || 'MISSING')
  console.log('  warranty_score:', data.warranty_score || 'MISSING')
  console.log('  social_score:', data.social_score || 'MISSING')
  console.log('  sustainability_score:', data.sustainability_score || 'MISSING')
  console.log('  bifl_total_score:', data.bifl_total_score || 'MISSING')

  console.log('\nNotes:')
  console.log('  durability_notes:', data.durability_notes ? 'EXISTS (' + data.durability_notes.substring(0, 50) + '...)' : 'MISSING')
  console.log('  repairability_notes:', data.repairability_notes ? 'EXISTS' : 'MISSING')
  console.log('  warranty_notes:', data.warranty_notes ? 'EXISTS' : 'MISSING')
  console.log('  social_notes:', data.social_notes ? 'EXISTS' : 'MISSING')
}

checkBriggsRiley()
