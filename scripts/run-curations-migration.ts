import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  console.log('Running curations migration...')

  const sqlPath = join(process.cwd(), 'supabase', 'migrations', 'create_curations_tables.sql')
  const sql = readFileSync(sqlPath, 'utf-8')

  const { data, error } = await supabase.rpc('exec_sql', { sql })

  if (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }

  console.log('✅ Curations tables created successfully!')
}

runMigration()
