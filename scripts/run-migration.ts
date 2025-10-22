import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runMigration() {
  console.log('\n=== RUNNING DATABASE MIGRATION ===\n')

  // Read the migration file
  const sql = fs.readFileSync('supabase/migrations/add_buying_guide_toggle.sql', 'utf-8')

  console.log('Executing SQL:')
  console.log(sql)
  console.log('')

  // Execute each statement separately
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--'))

  for (const statement of statements) {
    if (!statement) continue

    console.log('Executing:', statement.substring(0, 50) + '...')

    const { error } = await supabase.rpc('exec_sql' as any, { sql: statement })

    if (error) {
      // Try alternative approach - direct query
      const { error: altError } = await (supabase as any).from('_raw_sql').select(statement)

      if (altError) {
        console.log('⚠️  Could not execute via API. Manual execution required.')
        console.log('Please run this in Supabase Dashboard > SQL Editor:')
        console.log(sql)
        return
      }
    }
  }

  console.log('✅ Migration completed successfully!')

  // Verify
  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, name, show_buying_guide')
    .limit(5)

  if (error) {
    console.log('⚠️  Column may not exist yet')
    console.log('Please run this SQL manually in Supabase Dashboard > SQL Editor:')
    console.log(sql)
  } else {
    console.log('\n✅ Verified! Sample categories:')
    categories.forEach(cat => {
      console.log(`  - ${cat.name}: show_buying_guide = ${cat.show_buying_guide}`)
    })
  }
}

runMigration()
