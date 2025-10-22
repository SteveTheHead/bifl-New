import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function showNotes() {
  const { data } = await supabase
    .from('products')
    .select('name, durability_notes')
    .eq('id', 'e9210d1f-4912-43e4-8afa-73f446a538dd')
    .single()

  console.log('\n=== Work Briefcase Durability Notes ===\n')
  console.log(data?.durability_notes || 'NULL')
}

showNotes()
