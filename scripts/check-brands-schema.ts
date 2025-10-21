import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
  const { data } = await supabase
    .from('brands')
    .select('*')
    .limit(1)

  if (data && data.length > 0) {
    console.log('Brands table columns:', Object.keys(data[0]))
  }
}

checkSchema()
