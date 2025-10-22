import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkProduct() {
  const { data } = await supabase
    .from('products')
    .select('name, durability_notes, repairability_notes, warranty_notes, social_notes')
    .eq('id', 'ea8fae7d-0423-4747-8c62-ad8e24dedf91')
    .single()

  console.log('\n289 Multimeter\n')
  console.log('durability_notes (first 100 chars):')
  console.log(data?.durability_notes?.substring(0, 100))
  console.log('\nrepairability_notes (first 100 chars):')
  console.log(data?.repairability_notes?.substring(0, 100))
  console.log('\nwarranty_notes (first 100 chars):')
  console.log(data?.warranty_notes?.substring(0, 100))
  console.log('\nsocial_notes (first 100 chars):')
  console.log(data?.social_notes?.substring(0, 100))
}

checkProduct()
